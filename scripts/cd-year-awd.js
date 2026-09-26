// Gives the earlier model years of a line their own `awd`, from Car and Driver's spec page for that
// year: the page lists every trim of the year, and the trim names carry the drivetrain ("SE AWD",
// "Premium quattro", "Twin Motor AWD Plus", "Select RWD"). Marked secondary. Pages are the ones in
// scripts/lists/cd-year-specs.json, the same list cd-year-specs.js reads for dimensions.
//
// Each name is read against a fixed table of drivetrain words (below), so nothing is inferred from a
// trim's rank or a maker's habits: a name with no such word is "unknown". A year gets `awd` only when
// the names settle it: every trim AWD is "standard", some AWD is "available" (an unknown trim is then
// left off `not_awd` and said so), none AWD and none unknown is "none". A page's own check: it shows
// one trim's specs with an explicit "Drivetrain" row, and that must agree with the reading of that
// trim's name. C/D's "*Ltd Avail*" markers are dropped and duplicates folded.
//
// Rebuilds its own `awd` wholesale and nothing else: a year's `awd` from any other source is never
// replaced, and the line's newest year isn't listed (its `awd` is the maker's).
// Usage: node scripts/cd-year-awd.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');
const { newestYear } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'cd-year-specs.json'), 'utf8'));
const listed = new Set(pages.map((p) => p.url));
const DIMS = ['length_in', 'width_in', 'height_in', 'cargo_cu_ft', 'ground_clearance_in', 'turning_circle_ft'];

const retrieved = new Map(); // fetch slug -> date of its latest HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , slug] = line.split('\t');
  if (status === '200') retrieved.set(slug, date);
}

// The makers' words for two driven axles, and for one.
const AWD_WORDS = /\b(AWD|eAWD|4WD|quattro|xDrive|4MATIC|ALL4|e-4ORCE|Twin Motor|Dual[ -]Motor)\b/i;
const ONE_AXLE_WORDS = /\b(RWD|FWD|Single Motor)\b/i;
const drive = (name) => (AWD_WORDS.test(name) ? 'awd' : ONE_AXLE_WORDS.test(name) ? 'not' : 'unknown');
const tidy = (name) => name.replace(/\s*\*Ltd Avail\*\s*/g, ' ').replace(/\s+/g, ' ').trim();

function read(pg) {
  const file = path.join(root, 'sources', `${pg.slug}.html`);
  if (!retrieved.has(pg.slug) || !fs.existsSync(file)) return { problem: 'not saved' };
  const next = fs.readFileSync(file, 'utf8').match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  const data = next && JSON.parse(next[1]).props.pageProps.data;
  if (!data || !data.chromeStyle) return { problem: 'no spec data on the page' };
  // The address names a year; the page says which year it actually shows.
  if (String(data.specsSubmodel.year) !== pg.model_year) return { problem: `page shows ${data.specsSubmodel.year}` };
  const cfg = data.chromeStyle[0].dataset.configuration;

  // The page's own check: the shown trim's Drivetrain row against the reading of its name.
  const shownName = `${cfg.style.trimName} ${cfg.style.styleNameWithoutTrim}`.trim();
  const shownRow = (cfg.technicalSpecifications.find((x) => x.ConsumerFriendlyTitleName === 'Drivetrain') || {}).value || '';
  const rowSays = /^All/i.test(shownRow) ? 'awd' : /^(Rear|Front)/i.test(shownRow) ? 'not' : 'unknown';
  const nameSays = drive(shownName);
  if (nameSays !== 'unknown' && rowSays !== 'unknown' && nameSays !== rowSays) {
    return { problem: `name '${shownName}' reads ${nameSays}, Drivetrain row says '${shownRow}'` };
  }

  const names = [...new Set((data.trimsOptions || []).map((t) => tidy(t.name)))];
  const by = { awd: [], not: [], unknown: [] };
  for (const n of names) by[drive(n)].push(n);
  const count = `${by.awd.length} AWD, ${by.not.length} not, ${by.unknown.length} unknown of ${names.length}`;
  if (!names.length) return { problem: 'no trims listed' };
  if (!by.awd.length && by.unknown.length) return { problem: `drivetrain not in the trim names (${count})` };

  const value = by.awd.length === names.length ? 'standard' : by.awd.length ? 'available' : 'none';
  const check = rowSays === 'unknown' ? '' : ` The page's '${shownName}' shows Drivetrain '${shownRow}'.`;
  const unknown = by.unknown.length ? ` ${by.unknown.length} trim(s) with no drivetrain in the name are left off: ${by.unknown.join(', ')}.` : '';
  const awd = {
    value,
    ...(value !== 'none' ? { trims: by.awd } : {}),
    ...(by.not.length ? { not_awd: by.not } : {}),
    secondary: true,
    source: pg.url,
    retrieved: retrieved.get(pg.slug),
    note: `Read from the drivetrain words in C/D's ${pg.model_year} trim names, as printed.${check}${unknown}`,
  };
  return { awd, count, shownName, shownRow };
}

const report = [];
for (const model of new Set(pages.map((p) => p.model))) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  const newest = newestYear(m);
  for (const e of Object.values(m.years)) if (e.awd?.secondary && listed.has(e.awd.source)) delete e.awd;

  for (const pg of pages.filter((p) => p.model === model)) {
    const { awd, count, shownName, shownRow, problem } = read(pg);
    if (problem) { report.push(`${problem.padEnd(26)} ${model} ${pg.model_year}  ${pg.url}`); continue; }
    if (pg.model_year === newest) { report.push(`${'newest year'.padEnd(26)} ${model} ${pg.model_year}  left to the maker's source`); continue; }
    const year = m.years[pg.model_year];
    if (!year) { report.push(`${'no such year'.padEnd(26)} ${model} ${pg.model_year}  nothing else describes it`); continue; }
    if (year.awd) { report.push(`${'already sourced'.padEnd(26)} ${model} ${pg.model_year}  ${year.awd.source}`); continue; }
    // Dimensions lead a year, as they lead the file; `awd` follows them, as it leads the newest year.
    const dims = Object.fromEntries(DIMS.filter((f) => year[f]).map((f) => [f, year[f]]));
    const rest = Object.fromEntries(Object.entries(year).filter(([k]) => !DIMS.includes(k)));
    m.years[pg.model_year] = { ...dims, awd, ...rest };
    console.log(`${model.padEnd(27)} ${pg.model_year}  ${awd.value.padEnd(9)} ${count.padEnd(32)} check: '${shownName}' = ${shownRow}`);
  }
  writeJson(file, m);
}
if (report.length) console.log(`\n${report.join('\n')}`);

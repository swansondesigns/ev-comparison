// Gives the earlier model years of a line their own dimensions, from Car and Driver's spec page for
// that year: length, width without mirrors, height, cargo and turning circle, marked secondary. A line's
// own figures are sourced for its newest year only; a 2024 car needs a 2024 source, and a facelift can
// move a number. Pages are listed in scripts/lists/cd-year-specs.json (fetch-batch's { url, slug } plus
// `model` and `model_year`; addresses come from the submodel list in the line's saved spec page) and
// saved by `node scripts/fetch-batch.js scripts/lists/cd-year-specs.json 4`.
//
// Rebuilds its own figures wholesale and nothing else: a year's figure from any other source is never
// replaced (manufacturer sources take priority), and the line's newest year isn't listed.
// Prints each year's figures against the line's, so a change between years shows.
// Usage: node scripts/cd-year-specs.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');

const root = path.join(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'cd-year-specs.json'), 'utf8'));
const FIELDS = ['length_in', 'width_in', 'height_in', 'cargo_cu_ft', 'turning_circle_ft'];
const listed = new Set(pages.map((p) => p.url));

const retrieved = new Map(); // fetch slug -> date of its latest HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , slug] = line.split('\t');
  if (status === '200') retrieved.set(slug, date);
}

const num = (v) => (v == null || v === '' || v === 'N/A' || Number.isNaN(Number(v)) ? null : Number(v));

function read(pg) {
  const file = path.join(root, 'sources', `${pg.slug}.html`);
  if (!retrieved.has(pg.slug) || !fs.existsSync(file)) return { problem: 'not saved' };
  const next = fs.readFileSync(file, 'utf8').match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  const data = next && JSON.parse(next[1]).props.pageProps.data;
  if (!data || !data.chromeStyle) return { problem: 'no spec data on the page' };
  // The address names a year; the page says which year it actually shows.
  if (String(data.specsSubmodel.year) !== pg.model_year) return { problem: `page shows ${data.specsSubmodel.year}` };
  const cfg = data.chromeStyle[0].dataset.configuration;
  const spec = (title) => num((cfg.technicalSpecifications.find((x) => x.ConsumerFriendlyTitleName === title) || {}).value);
  const shown = `C/D ${pg.model_year} ${`${cfg.style.trimName} ${cfg.style.styleNameWithoutTrim}`.trim()}`;
  const base = { secondary: true, source: pg.url, retrieved: retrieved.get(pg.slug) };

  const out = {};
  const one = (field, title) => {
    const value = spec(title);
    if (value != null) out[field] = { value, ...base, note: `${shown}, '${title}'.` };
  };
  one('length_in', 'Length (inches)');
  one('width_in', 'Width, without mirrors (inches)');
  one('height_in', 'Height (inches)');
  const up = spec('Cargo Space/Area Behind Second Row (cubic feet)');
  const down = spec('Cargo Space/Area Behind Front Row (cubic feet)');
  if (up != null || down != null) {
    out.cargo_cu_ft = { seats_up: up, seats_down: down, ...base, note: `${shown}, cargo space behind the second row and behind the front row.` };
  }
  // C/D's row is 'Diameter / Radius'; anything under 25 ft would be a radius, so leave it out.
  const turn = spec('Turning Diameter / Radius, curb to curb (feet)');
  if (turn != null && turn >= 25) out.turning_circle_ft = { value: turn, ...base, note: `${shown}, 'Turning Diameter / Radius, curb to curb (feet)'.` };
  return { facts: out };
}

const show = (f) => (f == null ? '-' : f.value ?? `${f.seats_up}/${f.seats_down}`);
const report = [];
for (const model of new Set(pages.map((p) => p.model))) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [y, e] of Object.entries(m.years)) {
    for (const f of FIELDS) if (e[f]?.secondary && listed.has(e[f].source)) delete e[f];
    if (!Object.keys(e).length) delete m.years[y];
  }

  for (const pg of pages.filter((p) => p.model === model)) {
    const { facts, problem } = read(pg);
    if (problem) { report.push(`${problem.padEnd(26)} ${model} ${pg.model_year}  ${pg.url}`); continue; }
    const year = m.years[pg.model_year] ?? {};
    const mine = Object.fromEntries(FIELDS.filter((f) => facts[f] && !year[f]).map((f) => [f, facts[f]]));
    // Dimensions lead a year, as they lead the file.
    m.years[pg.model_year] = { ...mine, ...year };
    const diff = FIELDS.filter((f) => mine[f] && m[f] && show(mine[f]) !== show(m[f])).map((f) => `${f} ${show(mine[f])} (line: ${show(m[f])})`);
    console.log(`${model.padEnd(27)} ${pg.model_year}  ${Object.keys(mine).length} figures${diff.length ? `   differs: ${diff.join(', ')}` : ''}`);
  }
  writeJson(file, m);
}
if (report.length) console.log(`\n${report.join('\n')}`);

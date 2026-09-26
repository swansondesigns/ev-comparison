// Rebuilds `price` in every listed model: what the cheapest all-wheel-drive version of each model year
// costs new, from Car and Driver's page for each version (scripts/lists/cd-styles.json, saved by
// `node scripts/fetch-batch.js scripts/lists/cd-styles.json 4`). She is considering only the cheapest
// version with all-wheel drive, so that is the one figure kept. Every year's `price` is replaced
// wholesale, so edit the list, never a model file's `price`.
//
// A version page shows one version: its name, its price with delivery included, and a "Drivetrain" row.
// A page counts only if it shows the model year and version it was listed for (an unknown address can
// fall back to a default version) and its Drivetrain row says all- or four-wheel drive. The cheapest
// such page is the year's price, `secondary` like every Car and Driver figure. For a 2024 or 2025 car
// it is the price when new, which is background for a used one.
//
// The list comes from the version ids in the saved spec pages' submodel lists, 2024 on. Left out of it:
// versions whose C/D name says they drive one axle, and sub-lines that are separate cars (Optiq-V, GV60
// Magma, the 2024 Mach-E GT, the 2025 Model Y Performance, the Model Y L). Body variants (the Q6
// Sportback) stay in, as they do for EPA range.
//
// Where C/D has no version pages for a year and every version of it is all-wheel drive (its `awd` is
// "standard"), the review page's own data stands in: its cheapest trim is then the cheapest AWD version.
// Usage: node scripts/price.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');
const { newestYear } = require('../src/lib/model.mjs');
const { cheapestAwdRange } = require('../src/lib/cheapest.mjs');

const root = path.join(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'cd-styles.json'), 'utf8'));
const reviews = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'ratings-pages.json'), 'utf8')).filter((p) => p.site === 'caranddriver');

const retrieved = new Map(); // fetch slug -> date of its latest HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split(/\r?\n/)) {
  const [date, status, , slug] = line.split('\t');
  if (status === '200') retrieved.set(slug, date);
}
const nextData = (slug) => {
  const file = path.join(root, 'sources', `${slug}.html`);
  if (!retrieved.has(slug) || !fs.existsSync(file)) return null;
  const m = fs.readFileSync(file, 'utf8').match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  return m ? JSON.parse(m[1]).props.pageProps.data : null;
};
const money = (v) => `$${v.toLocaleString('en-US')}`;

function readVersion(pg) {
  const data = nextData(pg.slug);
  if (!data) return { problem: 'not saved' };
  if (!data.chromeStyle) return { problem: 'no spec data' };
  if (String(data.specsSubmodel.year) !== pg.model_year || data.specsSubmodel.style_id !== pg.style_id) {
    return { problem: `shows ${data.specsSubmodel.year} version ${data.specsSubmodel.style_id}` };
  }
  const style = data.chromeStyle[0];
  const cfg = style.dataset.configuration;
  const spec = (title) => (cfg.technicalSpecifications.find((x) => x.ConsumerFriendlyTitleName === title) || {}).value || '';
  const drive = spec('Drivetrain');
  const wheels = Number(spec('Front Wheel Size (inches)').match(/^\s*(\d{2})\b/)?.[1]) || null;
  return {
    trim: `${cfg.style.trimName} ${cfg.style.styleNameWithoutTrim}`.replace(/\s+/g, ' ').trim(),
    msrp: typeof style.base_msrp === 'number' && style.base_msrp > 0 ? style.base_msrp : null,
    wheels,
    drive,
    awd: /^(All|Four) Wheel Drive/i.test(drive),
  };
}

// model -> year -> the year's AWD versions, read
const byModel = new Map();
const report = [];
for (const pg of pages) {
  const v = readVersion(pg);
  if (v.problem) { report.push(`${v.problem.padEnd(24)} ${pg.model} ${pg.model_year} ${pg.style_id}`); continue; }
  const years = byModel.get(pg.model) ?? byModel.set(pg.model, {}).get(pg.model);
  const list = (years[pg.model_year] ??= []);
  if (v.awd && v.msrp != null) list.push({ ...v, pg });
}

function fromVersions(list) {
  if (!list?.length) return null;
  const [low] = [...list].sort((a, b) => a.msrp - b.msrp || a.pg.style_id - b.pg.style_id);
  return {
    value: low.msrp,
    trim: low.trim,
    ...(low.wheels ? { wheels_in: low.wheels } : {}),
    source: low.pg.url,
    retrieved: retrieved.get(low.pg.slug),
    secondary: true,
    note: `Car and Driver's price for the ${low.trim}, the cheapest of the ${list.length} all-wheel-drive version(s) it lists for ${low.pg.model_year}, delivery included; its page shows Drivetrain '${low.drive}'.`,
  };
}

// An all-AWD year with no version pages: the review page's cheapest trim.
function fromReview(model, year) {
  for (const pg of reviews.filter((p) => p.model === model)) {
    const data = nextData(pg.slug);
    const y = data?.content?.[0]?.vehicle_models?.[0]?.years?.find((x) => String(x.year) === year);
    const trims = (y?.chrome_trims || []).filter((t) => t.msrp_low_style?.base_msrp > 0);
    if (!trims.length) continue;
    const low = trims.reduce((a, b) => (b.msrp_low_style.base_msrp < a.msrp_low_style.base_msrp ? b : a));
    return {
      value: low.msrp_low_style.base_msrp,
      trim: low.name,
      source: pg.url,
      retrieved: retrieved.get(pg.slug),
      secondary: true,
      note: `Car and Driver's price for the ${low.name}, the cheapest of its ${year} trims, delivery included; every ${year} version is all-wheel drive. From the review page's data: C/D has no page per version for this year.`,
    };
  }
  return null;
}

const models = new Set([...pages.map((p) => p.model), ...reviews.map((p) => p.model)]);
for (const model of models) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  if (!fs.existsSync(file)) continue;
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [y, e] of Object.entries(m.years)) {
    delete e.price;
    if (!Object.keys(e).length) delete m.years[y];
  }
  for (const year of Object.keys(m.years).filter((y) => Number(y) >= 2024)) {
    const price = fromVersions(byModel.get(model)?.[year]) ?? (m.years[year].awd?.value === 'standard' ? fromReview(model, year) : null);
    if (!price) continue;
    // `price` goes ahead of the year's `ratings` and `links`, which stay last.
    const { ratings, links, ...rest } = m.years[year];
    m.years[year] = { ...rest, price, ...(ratings ? { ratings } : {}), ...(links ? { links } : {}) };
  }
  writeJson(file, m);
}

// Coverage, for the passing lines: every year from 2024, whether the newest is priced, and the EPA range
// the site will show for that version (src/lib/cheapest.mjs), or "spread" where none matched.
let priced = 0, n = 0, matched = 0, withPrice = 0;
const matches = [];
for (const model of new Set(reviews.map((p) => p.model))) {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'data', 'models', `${model}.json`), 'utf8'));
  const newest = newestYear(m);
  const ys = Object.keys(m.years).filter((y) => Number(y) >= 2024).sort().reverse();
  n++; if (m.years[newest]?.price) priced++;
  console.log(`${model.padEnd(27)} ${ys.map((y) => `${y}${y === newest ? '*' : ''} ${m.years[y].price ? `${money(m.years[y].price.value)} ${m.years[y].price.trim}` : '-'}`).join('   ')}`);
  for (const y of ys.filter((x) => m.years[x].price && m.years[x].epa_range)) {
    const r = cheapestAwdRange({ ...m, ...m.years[y] });
    withPrice++; if (r) matched++;
    matches.push(`  ${model.padEnd(27)} ${y}  ${m.years[y].price.trim.padEnd(34)} ${r ? `${r.value} mi  by ${r.how}  [${r.entries.join(' | ')}]` : 'spread'}`);
  }
}
console.log(`\nEPA range for the priced version: ${matched} of ${withPrice} car-years matched\n${matches.join('\n')}`);
console.log(`\nPriced for the newest model year (*): ${priced} of ${n}`);
if (report.length) console.log(`\n${report.join('\n')}`);

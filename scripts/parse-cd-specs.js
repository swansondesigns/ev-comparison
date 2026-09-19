// Summarize saved Car and Driver spec pages (sources/cd-specs-*.html) into
// data/work/cd-specs.json. Cross-check/fallback data only; manufacturer
// sources take priority.
// Usage: node scripts/parse-cd-specs.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'cd-specs.json'), 'utf8'));
const log = fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8')
  .trim().split('\n').map((l) => l.split('\t'));

const out = [];
for (const { model, url, slug } of list) {
  const row = log.filter((r) => r[3] === slug).pop();
  const entry = { model, source: url, saved_as: `sources/${slug}.html`, retrieved: row ? row[0] : null, http: row ? row[1] : null };
  out.push(entry);
  if (!row || row[1] !== '200') continue;

  const html = fs.readFileSync(path.join(root, 'sources', slug + '.html'), 'utf8');
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  const data = JSON.parse(m[1]).props.pageProps.data;
  if (!data || !data.chromeStyle) { entry.note = 'No spec data on page'; continue; }

  const cfg = data.chromeStyle[0].dataset.configuration;
  const spec = (title) => {
    const t = cfg.technicalSpecifications.find((x) => x.ConsumerFriendlyTitleName === title);
    return t && t.value !== 'N/A' ? t.value : null;
  };
  const vm = data.content[0].vehicle_models[0];
  // C/D's default year can lag the newest one, and a model can have several
  // submodels per year (body styles, trim groups); only one is shown per page.
  entry.specs_year = data.specsSubmodel.year;
  entry.specs_submodel = data.specsSubmodel.id;
  entry.years_on_cd = [...new Set(vm.submodels.map((s) => s.year))];
  const latest = Math.max(...entry.years_on_cd);
  entry.latest_year_submodels = vm.submodels.filter((s) => s.year === latest).map((s) => `${s.id} (${s.name})`);
  entry.style_shown = `${cfg.style.trimName} ${cfg.style.styleNameWithoutTrim}`.trim();
  entry.length_in = Number(spec('Length (inches)')) || null;
  entry.width_no_mirrors_in = Number(spec('Width, without mirrors (inches)')) || null;
  entry.drivetrain_shown = spec('Drivetrain');
  entry.trims = data.trimsOptions.map((t) => t.name);
}

fs.mkdirSync(path.join(root, 'data', 'work'), { recursive: true });
fs.writeFileSync(path.join(root, 'data', 'work', 'cd-specs.json'), JSON.stringify(out, null, 2) + '\n');
for (const e of out) {
  if (e.http !== '200') { console.log(`${e.model}: HTTP ${e.http}`); continue; }
  console.log(`${e.model}: ${e.specs_year} [${e.years_on_cd.join(',')}] L=${e.length_in} W=${e.width_no_mirrors_in} (${e.style_shown}, ${e.drivetrain_shown})${e.note ? ' ' + e.note : ''}`);
  console.log(`    trims: ${e.trims.join(' | ')}`);
  if (e.latest_year_submodels.length > 1 || e.specs_submodel !== e.latest_year_submodels[0].split(' ')[0]) {
    console.log(`    shown: ${e.specs_submodel}; latest-year submodels: ${e.latest_year_submodels.join(' | ')}`);
  }
}

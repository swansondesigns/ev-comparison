// Best-effort extras for models that have none: height, cargo and turning circle from the saved
// Car and Driver spec pages (sources/cd-specs-*.html), marked secondary. Extras are not must-haves
// (ev-research-reply-2.md), so this only fills fields a model file lacks and never replaces a maker's figure.
// Usage: node scripts/cd-extras.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');
const { gates, passes } = require('../src/lib/gates.mjs');
const { resolve } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'data', 'models');
const cd = JSON.parse(fs.readFileSync(path.join(root, 'data', 'work', 'cd-specs.json'), 'utf8'));
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

const num = (v) => (v == null || v === '' || v === 'N/A' || Number.isNaN(Number(v)) ? null : Number(v));

function specs(savedAs) {
  const html = fs.readFileSync(path.join(root, savedAs), 'utf8');
  const m = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  const data = JSON.parse(m[1]).props.pageProps.data;
  if (!data || !data.chromeStyle) return null;
  const tech = data.chromeStyle[0].dataset.configuration.technicalSpecifications;
  return (title) => num((tech.find((x) => x.ConsumerFriendlyTitleName === title) || {}).value);
}

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json'))) {
  const file = path.join(dir, f);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (!passes(gates(resolve(m)))) continue; // only models that get a one-sheet
  const entry = cd.find((c) => norm(c.model) === norm(`${m.make} ${m.model}`));
  if (!entry || entry.http !== '200' || !entry.style_shown) continue;
  const spec = specs(entry.saved_as);
  if (!spec) continue;

  const base = { secondary: true, source: entry.source, retrieved: entry.retrieved };
  const shown = `C/D ${entry.specs_year} ${entry.style_shown}`;
  const added = [];

  const height = spec('Height (inches)');
  if (!m.height_in && height != null) {
    m.height_in = { value: height, ...base, note: `${shown}, 'Height (inches)'.` };
    added.push('height');
  }
  const up = spec('Cargo Space/Area Behind Second Row (cubic feet)');
  const down = spec('Cargo Space/Area Behind Front Row (cubic feet)');
  if (!m.cargo_cu_ft && (up != null || down != null)) {
    m.cargo_cu_ft = { seats_up: up, seats_down: down, ...base, note: `${shown}, cargo space behind the second row and behind the front row.` };
    added.push('cargo');
  }
  const turn = spec('Turning Diameter / Radius, curb to curb (feet)');
  // C/D's row is 'Diameter / Radius'; anything under 25 ft would be a radius, so leave it out.
  if (!m.turning_circle_ft && turn != null && turn >= 25) {
    m.turning_circle_ft = { value: turn, ...base, note: `${shown}, 'Turning Diameter / Radius, curb to curb (feet)'.` };
    added.push('turning circle');
  }

  if (!added.length) continue;
  // These belong to the line, so they go ahead of `years`, `links` and `notes`, which stay last.
  const { years, links, notes, ...facts } = m;
  writeJson(file, { ...facts, years, ...(links ? { links } : {}), ...(notes ? { notes } : {}) });
  console.log(`${f.replace(/\.json$/, '')}: ${added.join(', ')} (${shown})`);
}

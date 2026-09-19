// Search EPA's bulk file (sources/fe-vehicles.csv, from fueleconomy.gov/feg/epadata/vehicles.csv.zip) for EVs.
// Usage: node scripts/fe-find.js <make regex> [model regex] [minYear]
// Prints id, year, make, model, drive, EPA range (mi), motor, and when EPA last modified the record.
const fs = require('fs');
const path = require('path');

const [makeRe, modelRe = '.', minYear = '2024'] = process.argv.slice(2);
const text = fs.readFileSync(path.join(__dirname, '..', 'sources', 'fe-vehicles.csv'), 'utf8');

// Minimal CSV parser: quoted fields may contain commas.
function parseLine(line) {
  const out = [];
  let cur = '', q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') q = false;
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

const lines = text.split(/\r?\n/).filter(Boolean);
const head = parseLine(lines[0]);
const rows = lines.slice(1).map((l) => Object.fromEntries(parseLine(l).map((v, i) => [head[i], v])));

const mk = new RegExp(makeRe, 'i');
const md = new RegExp(modelRe, 'i');
rows
  .filter((r) => r.atvType === 'EV' && +r.year >= +minYear && mk.test(r.make) && md.test(r.model))
  .sort((a, b) => a.year - b.year || a.model.localeCompare(b.model))
  .forEach((r) => console.log([r.id, r.year, r.make, r.model, r.drive, r.range, r.evMotor, r.modifiedOn].join(' | ')));

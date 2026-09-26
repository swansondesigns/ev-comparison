// Gives the earlier model years of a line their plug facts, `charge_port` and `supercharger_access`,
// from scripts/lists/plug-years.json: one entry per car-year, read by hand from a maker document
// that speaks to that year. An entry names the port (CCS1 or NACS), whether the car can use Tesla
// Superchargers and how (`via`: port or adapter), the document's URL, and a note quoting it. The
// retrieval date is the document's latest HTTP 200 in the fetch log; an entry read in a browser
// instead carries `read` (the date) and is said to be read by hand. An entry may instead say
// `same_as: <year>`, and both facts are copied from that year of the line with the note added.
//
// Rebuilds the listed car-years wholesale and nothing else: a year that isn't listed is never
// touched, and the line's newest year is refused (its facts are the maker's for that year).
// Usage: node scripts/plug-years.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');
const { newestYear } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const entries = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'plug-years.json'), 'utf8'));
const FIELDS = ['charge_port', 'supercharger_access'];
const LEAD = ['length_in', 'width_in', 'height_in', 'cargo_cu_ft', 'ground_clearance_in', 'turning_circle_ft', 'awd'];

const retrieved = new Map(); // url -> date of its latest HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split(/\r?\n/)) {
  const [date, status, , , url] = line.split('\t');
  if (status === '200') retrieved.set(url, date);
}

function facts(entry, m) {
  if (entry.same_as) {
    const from = m.years[entry.same_as];
    if (!from || !FIELDS.every((f) => from[f])) return { problem: `no plug facts on ${entry.same_as} to copy` };
    const out = {};
    for (const f of FIELDS) out[f] = { ...from[f], note: `${entry.note} (${entry.same_as}: ${from[f].note})` };
    return { out, how: `as ${entry.same_as}` };
  }
  const date = entry.read || retrieved.get(entry.source);
  if (!date) return { problem: 'not saved' };
  const note = entry.read ? `Read by hand by Graham, ${entry.read}. ${entry.note}` : entry.note;
  const base = { source: entry.source, retrieved: date, note };
  return {
    out: {
      charge_port: { value: entry.charge_port, ...base },
      supercharger_access: { value: entry.supercharger_access, ...(entry.via ? { via: entry.via } : {}), ...base },
    },
    how: `${entry.charge_port} · ${entry.supercharger_access}${entry.via ? ' via ' + entry.via : ''}${entry.read ? ' (by hand)' : ''}`,
  };
}

const report = [];
for (const model of new Set(entries.map((e) => e.model))) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  const newest = newestYear(m);
  for (const entry of entries.filter((e) => e.model === model)) {
    const { out, how, problem } = facts(entry, m);
    if (problem) { report.push(`${problem.padEnd(26)} ${model} ${entry.year}  ${entry.source || ''}`); continue; }
    if (entry.year === newest) { report.push(`${'newest year'.padEnd(26)} ${model} ${entry.year}  left to the maker's source`); continue; }
    const year = m.years[entry.year];
    if (!year) { report.push(`${'no such year'.padEnd(26)} ${model} ${entry.year}  nothing else describes it`); continue; }
    // Dimensions and `awd` lead a year; the plug facts follow them, as on the newest year.
    const lead = Object.fromEntries(LEAD.filter((f) => year[f]).map((f) => [f, year[f]]));
    const rest = Object.fromEntries(Object.entries(year).filter(([k]) => !LEAD.includes(k) && !FIELDS.includes(k)));
    m.years[entry.year] = { ...lead, ...out, ...rest };
    console.log(`${model.padEnd(27)} ${entry.year}  ${how}`);
  }
  writeJson(file, m);
}
if (report.length) console.log(`\n${report.join('\n')}`);

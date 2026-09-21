// Write each model year's epa_range into data/models/<slug>.json (years[year].epa_range) from saved
// fueleconomy.gov vehicle records.
// Usage: node scripts/epa-range.js
// Reads scripts/lists/epa-range.json ({ slug: { <year>: { listing_year?, ids[], maker_estimate?, cross_check_ids?, note? } } }).
// Each id is a number or { id, applies_to } naming the maker's trims that EPA listing covers; a bare
// number leaves the entry under EPA's own label.
// listing_year: the EPA model year the ids belong to, where EPA hasn't listed that model year yet.
// and sources/fe-vehicle-<id>.xml (fetched with scripts/lists/fe-vehicles.json).
// Replaces a listed model's epa_range in every year, so a year dropped from the list loses its range;
// other fields are untouched.
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');

const root = path.join(__dirname, '..');
const plan = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'epa-range.json'), 'utf8'));

// Retrieval date per slug, from the fetch log (latest HTTP 200 wins).
const retrieved = {};
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , slug] = line.split('\t');
  if (status === '200') retrieved[slug] = date;
}

const DRIVE = { 'All-Wheel Drive': 'AWD', '4-Wheel Drive': 'AWD', 'Front-Wheel Drive': 'FWD', 'Rear-Wheel Drive': 'RWD' };

function epaRecord(id) {
  const slug = `fe-vehicle-${id}`;
  const xml = fs.readFileSync(path.join(root, 'sources', `${slug}.xml`), 'utf8');
  const tag = (t) => (xml.match(new RegExp(`<${t}>([^<]*)</${t}>`)) || [])[1];
  if (!DRIVE[tag('drive')]) throw new Error(`${id}: unknown drive '${tag('drive')}'`);
  // Wheel size only where EPA's own label names it, e.g. "(19inch Wheels)" or "20 inch AWD".
  const wheels = (tag('model').match(/(\d{2})\s*-?\s*(?:inch|in\.)/i) || [])[1];
  return {
    epa_vehicle: tag('model'),
    drive: DRIVE[tag('drive')],
    ...(wheels ? { wheels_in: Number(wheels) } : {}),
    value: Number(tag('range')),
    year: tag('year'),
    epa_id: id,
    source: `https://www.fueleconomy.gov/ws/rest/vehicle/${id}`,
    retrieved: retrieved[slug],
  };
}

for (const [slug, years] of Object.entries(plan)) {
  const file = path.join(root, 'data', 'models', `${slug}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [y, e] of Object.entries(m.years)) {
    if (years[y]) continue;
    delete e.epa_range;
    if (!Object.keys(e).length) delete m.years[y];
  }
  for (const [year, p] of Object.entries(years)) writeYear(slug, m, year, p);
  writeJson(file, m);
}

function writeYear(slug, m, modelYear, p) {
  const listingYear = p.listing_year || modelYear;
  const entries = (p.ids || []).map((item) => {
    const { id, applies_to } = typeof item === 'number' ? { id: item } : item;
    const r = epaRecord(id);
    if (r.year !== listingYear) throw new Error(`${slug}: EPA ${id} is ${r.year}, expected ${listingYear}`);
    delete r.year;
    return applies_to ? { applies_to, ...r } : r;
  });

  // Maker's stated EPA estimate, used only where EPA has no listing for the model year quoted.
  if (p.maker_estimate) {
    const cc = (p.cross_check_ids || []).map((id) => {
      const r = epaRecord(id);
      return { value: r.value, source: r.source, retrieved: r.retrieved, note: `EPA ${r.year} ${r.epa_vehicle}` };
    });
    p.maker_estimate.entries.forEach((e, i) => entries.push({
      applies_to: e.trim,
      drive: 'AWD',
      value: e.value,
      estimate: true,
      source: p.maker_estimate.source,
      retrieved: retrieved[p.maker_estimate.slug],
      note: e.note,
      ...(cc[i] ? { cross_check: [cc[i]] } : {}),
    }));
  }

  const epa_range = {
    ...(p.listing_year ? { listing_year: p.listing_year } : {}),
    entries,
    ...(p.note ? { note: p.note } : {}),
  };
  // An existing epa_range keeps its place; a new one goes ahead of the year's `ratings` and `links`.
  const { ratings, links, ...rest } = m.years[modelYear] ?? {};
  m.years[modelYear] = { ...rest, epa_range, ...(ratings ? { ratings } : {}), ...(links ? { links } : {}) };
  const awd = entries.filter((e) => e.drive === 'AWD').map((e) => e.value);
  console.log(`${slug} ${modelYear}: ${entries.length} entries, AWD ${awd.length ? `${Math.min(...awd)}-${Math.max(...awd)} mi` : 'none'}${p.maker_estimate ? ' (maker estimate)' : ''}`);
}

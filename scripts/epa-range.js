// Write a model year's epa_range into data/models/<slug>.json (years[model_year].epa_range) from saved
// fueleconomy.gov vehicle records.
// Usage: node scripts/epa-range.js
// Reads scripts/lists/epa-range.json ({ slug: { model_year, listing_year?, ids[], maker_estimate?, cross_check_ids?, note? } }).
// Each id is a number or { id, applies_to } naming the maker's trims that EPA listing covers.
// listing_year: the EPA model year the ids belong to, where EPA hasn't listed the year the specs are quoted for.
// and sources/fe-vehicle-<id>.xml (fetched with scripts/lists/fe-vehicles.json).
// Replaces that year's existing epa_range; other fields and other years are untouched.
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

for (const [slug, p] of Object.entries(plan)) {
  const file = path.join(root, 'data', 'models', `${slug}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));

  const listingYear = p.listing_year || p.model_year;
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

  (m.years[p.model_year] ??= {}).epa_range = {
    ...(p.listing_year ? { listing_year: p.listing_year } : {}),
    entries,
    ...(p.note ? { note: p.note } : {}),
  };
  writeJson(file, m);
  const awd = entries.filter((e) => e.drive === 'AWD').map((e) => e.value);
  console.log(`${slug}: ${entries.length} entries, AWD ${Math.min(...awd)}-${Math.max(...awd)} mi${p.maker_estimate ? ' (maker estimate)' : ''}`);
}

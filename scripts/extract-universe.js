// Build data/universe.json from the saved ranking pages.
// Usage: node scripts/extract-universe.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const EDMUNDS_FILE = 'input/Best Electric SUVs of 2026 and 2027 - Expert Reviews and Rankings _ Edmunds.html';

// Retrieval dates: from the fetch log for pages curl fetched, from the file's
// modified date for pages saved by hand from a browser.
const log = fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8')
  .trim().split('\n').map((l) => l.split('\t'));
const fromLog = (slug) => {
  const rows = log.filter((r) => r[3] === slug);
  return rows.length ? rows[rows.length - 1][0] : null;
};
const fromMtime = (file) => fs.statSync(path.join(root, file)).mtime.toLocaleDateString('en-CA');

// Car and Driver: JSON-LD ItemList carries rank, make, model and year.
function carAndDriver(html) {
  const m = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/);
  const list = [].concat(JSON.parse(m[1])).find((x) => x['@type'] === 'ItemList');
  return list.itemListElement.map((e) => ({
    rank: e.position,
    name_as_listed: e.item.name,
    make: e.item.brand.name,
    model: e.item.model,
    model_year: e.item.productionDate,
    url: e.item.url,
  }));
}

// MotorTrend: server-rendered cards; rank comes from the "#N in Ranking
// Category" label (the "#N in Best Electric Compact SUVs" subtitle is missing
// on some cards), make from the /cars/<make>/<model> link.
function motorTrend(html) {
  const re = /data-id="ranked-vehicle-card-link"[^>]*href="([^"]+)"[^>]*>\s*<h2[^>]*>([\s\S]*?)<\/h2>[\s\S]*?#(\d+) in Ranking Category/g;
  const out = new Map();
  let m;
  while ((m = re.exec(html))) {
    const href = m[1];
    const name = m[2].replace(/<!-- -->/g, '').replace(/<[^>]+>/g, '').trim();
    const rank = Number(m[3]);
    if (out.has(name)) continue; // each card renders twice (mobile + desktop)
    const [year, ...words] = name.split(' ');
    const makeWords = href.split('/')[2].split('-').length;
    out.set(name, {
      rank,
      name_as_listed: name,
      make: words.slice(0, makeWords).join(' '),
      model: words.slice(makeWords).join(' '),
      model_year: year,
      url: 'https://www.motortrend.com' + href,
    });
  }
  return [...out.values()];
}

// Edmunds: rankings live in the window.EDM.preloadedState JSON, one entry per
// segment ("Small electric SUVs", "Small luxury electric SUVs", ...).
function edmundsState(html) {
  const start = html.indexOf('{', html.indexOf('window.EDM.preloadedState ='));
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === '\\') esc = true;
      else if (c === '"') inStr = false;
    } else if (c === '"') inStr = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) return JSON.parse(html.slice(start, i + 1));
  }
  throw new Error('preloadedState not closed');
}
function edmunds(segmentName) {
  return (html) => {
    const segments = edmundsState(html).typeRankings.types['suv,electric'].subtypes.electric.pageSize['100'];
    const seg = segments.find((s) => s.displayName === segmentName);
    return seg.segmentRatings.map((r) => {
      const y = r.modelYear;
      const link = `https://www.edmunds.com/${y.makeSlug}/${y.modelSlug}/${y.year}/`;
      return {
        rank: r.rank,
        name_as_listed: `${y.year} ${y.makeName} ${y.modelName}`,
        trim_rated: r.modelDisplayOverride || undefined,
        make: y.makeName,
        model: y.modelName,
        model_year: String(y.year),
        url: html.includes(`href="${link}"`) ? link : null,
      };
    });
  };
}

// Named in the handoff's unverified chat hints but on none of the ranking pages.
const HINTS = ['Kia EV3', 'Volvo EC40', 'Nissan Ariya'].map((name) => {
  const [make, ...model] = name.split(' ');
  return { rank: null, name_as_listed: null, make, model: model.join(' '), model_year: null, url: null };
});

const EDMUNDS_NOTE ='curl was blocked (HTTP 403, then an Akamai JavaScript challenge; see sources/edmunds-electric-suv.html). Page saved from a browser by Graham and parsed locally.';
const sources = [
  { id: 'caranddriver-compact', url: 'https://www.caranddriver.com/rankings/best-suvs/electric/compact', file: 'sources/cd-compact-rankings.html', retrieved: fromLog('cd-compact-rankings'), parse: carAndDriver },
  { id: 'caranddriver-subcompact', url: 'https://www.caranddriver.com/rankings/best-suvs/electric/subcompact', file: 'sources/cd-subcompact-rankings.html', retrieved: fromLog('cd-subcompact-rankings'), parse: carAndDriver },
  { id: 'caranddriver-luxury-compact', url: 'https://www.caranddriver.com/rankings/best-suvs/electric/luxury-compact', file: 'sources/cd-luxury-compact-rankings.html', retrieved: fromLog('cd-luxury-compact-rankings'), parse: carAndDriver, note: 'Added at Checkpoint 1 to cover luxury compacts.' },
  { id: 'motortrend-compact', url: 'https://www.motortrend.com/rankings/suvs/electric/compact', file: 'sources/mt-compact-rankings.html', retrieved: fromLog('mt-compact-rankings'), parse: motorTrend },
  { id: 'edmunds-small', url: 'https://www.edmunds.com/suv/electric/', section: 'Small electric SUVs', file: EDMUNDS_FILE, retrieved: fromMtime(EDMUNDS_FILE), parse: edmunds('Small electric SUVs'), note: EDMUNDS_NOTE },
  { id: 'edmunds-small-luxury', url: 'https://www.edmunds.com/suv/electric/', section: 'Small luxury electric SUVs', file: EDMUNDS_FILE, retrieved: fromMtime(EDMUNDS_FILE), parse: edmunds('Small luxury electric SUVs'), note: EDMUNDS_NOTE },
  { id: 'handoff-hint', url: null, file: 'ev-research-handoff.md', retrieved: null, parse: () => HINTS, note: 'Added at Graham\'s request after Checkpoint 1. Unverified leads from the chat session; model year and US status are established in Task 2.' },
];

// Different names for the same vehicle across sources.
const ALIASES = {
  minicountryman: 'minicountrymanelectric', // Edmunds: "Countryman" (rated as SE All4) in its EV segment
  porschemacan: 'porschemacanelectric', // Edmunds: "Macan" (rated as Macan Electric) in its EV segment
};
// Listed on its own by a source, but a variant of another model. Folded in per Graham.
const VARIANTS = {
  hyundaiioniq5n: { into: 'hyundaiioniq5', note: 'Car and Driver: "The performance version of Hyundai\'s Ioniq 5 EV" (sources/cd-hyundai-ioniq-5-n-2026.html).' },
};

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const models = new Map();
const sourceMeta = [];

for (const s of sources) {
  // A source with no URL (the handoff hints) has no saved page; its file is only a provenance label.
  const items = s.parse(s.url ? fs.readFileSync(path.join(root, s.file), 'utf8') : '');
  const ranks = items.map((it) => it.rank);
  const contiguous = ranks.every((r, i) => r === null || r === i + 1);
  sourceMeta.push({
    id: s.id, url: s.url, section: s.section, retrieved: s.retrieved, saved_as: s.file, count: items.length,
    note: [s.note, contiguous ? null : `Ranks recorded as published, not contiguous: ${ranks.join(', ')}.`].filter(Boolean).join(' ') || undefined,
  });
  for (const it of items) {
    // Some sources repeat the make in the model name ("Polestar Polestar 3").
    const model = it.model.toLowerCase().startsWith(it.make.toLowerCase() + ' ') ? it.model.slice(it.make.length + 1) : it.model;
    let k = norm(it.make + model);
    k = ALIASES[k] || k;
    const variant = VARIANTS[k];
    if (variant) k = variant.into;
    if (!models.has(k)) models.set(k, { make: it.make, model, listed_in: [] });
    const entry = models.get(k);
    if (variant) {
      entry.variants_folded_in = [...new Set([...(entry.variants_folded_in || []), `${it.make} ${model}`])];
      entry.note = variant.note;
    }
    entry.listed_in.push({
      source: s.id,
      rank: it.rank,
      model_year: it.model_year,
      name_as_listed: it.name_as_listed,
      variant: variant ? `${it.make} ${model}` : undefined,
      trim_rated: it.trim_rated,
      url: it.url,
      retrieved: s.retrieved,
    });
  }
}

const list = [...models.values()]
  .map((m) => ({
    make: m.make,
    model: m.model,
    model_years_listed: [...new Set(m.listed_in.map((l) => l.model_year).filter(Boolean))].sort(),
    variants_folded_in: m.variants_folded_in,
    note: m.note,
    listed_in: m.listed_in,
  }))
  .sort((a, b) => (a.make + ' ' + a.model).localeCompare(b.make + ' ' + b.model));

const blocked = [{
  id: 'edmunds-electric-suv (curl)',
  url: 'https://www.edmunds.com/suv/electric/',
  saved_as: 'sources/edmunds-electric-suv.html',
  note: 'HTTP 403, then an Akamai JavaScript challenge on one retry with client-hint headers. Superseded by the browser-saved copy in input/.',
}];

const out = { generated: new Date().toLocaleDateString('en-CA'), sources: sourceMeta, blocked_fetches: blocked, count: list.length, models: list };
fs.writeFileSync(path.join(root, 'data', 'universe.json'), JSON.stringify(out, null, 2) + '\n');

for (const s of sourceMeta) console.log(`${s.id}: ${s.count} models${s.note ? '  (' + s.note + ')' : ''}`);
console.log(`merged: ${list.length} models`);
for (const m of list) {
  console.log(`  ${m.make} ${m.model} [${m.model_years_listed.join('/')}]  ` + m.listed_in.map((l) => `${l.source}${l.rank != null ? ' #' + l.rank : ''}${l.variant ? ' (as ' + l.variant + ')' : ''}`).join(', '));
}

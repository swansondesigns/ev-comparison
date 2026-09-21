// Rebuilds `ratings` in every listed model from the pages in scripts/lists/ratings-pages.json, saved in
// sources/ by `node scripts/fetch-batch.js scripts/lists/ratings-pages.json 4`. A rating is filed under
// its model year (years[year].ratings[site]); a year nothing else describes yet holds only that. Every
// year's `ratings` is replaced wholesale, so edit the list, never a model file's `ratings`.
//
// Both sites score out of 10 and score each model year separately. The model year is read from the
// page's own title, never from its address: a year-less address shows whichever year the site chooses.
//   Car and Driver: the page's review data carries that year's rating, and the page lists earlier
//     model years with theirs ("C/D RATING: 7.5 /10 2025 Tesla Model Y"). A "What We Know So Far"
//     preview has no rating.
//   MotorTrend: one page per model year, each with that year's score in its review data. MotorTrend
//     says its scores compare only within a class, with 7.0 as average.
// A list entry's optional `rated_as` says what the page actually rates when that isn't quite this car
// (the whole Countryman line, the car under its earlier name).
// Usage: node scripts/ratings.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');
const { newestYear } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'ratings-pages.json'), 'utf8'));

const retrieved = new Map(); // url -> date of its first HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , , url] = line.split('\t');
  if (status === '200' && !retrieved.has(url)) retrieved.set(url, date);
}

const titleOf = (html) => (html.match(/<title[^>]*>([^<]*)</i)?.[1] || '').replace(/\s+/g, ' ').trim();
const visible = (html) => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ');
const ldRating = (html, key) => {
  const m = html.match(new RegExp('"' + key + '"\\s*:\\s*\\{[^{}]*?"ratingValue"\\s*:\\s*"?([\\d.]+)'));
  return m ? Number(m[1]) : null;
};

const byModel = new Map();
const report = [];
for (const pg of pages) {
  const file = path.join(root, 'sources', `${pg.slug}.html`);
  if (!retrieved.has(pg.url) || !fs.existsSync(file)) { report.push(`not saved   ${pg.model} ${pg.url}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = titleOf(html);
  const year = title.match(/^(\d{4}) /)?.[1];
  if (!year) { report.push(`no year     ${pg.model} ${pg.url} ('${title}')`); continue; }
  const base = { source: pg.url, retrieved: retrieved.get(pg.url), ...(pg.rated_as ? { rated_as: pg.rated_as } : {}) };
  const found = [];
  if (pg.site === 'caranddriver') {
    const now = ldRating(html, 'reviewRating');
    if (now != null) found.push({ model_year: year, value: now, ...base, note: `C/D rating in the page's review data; page titled '${title}'.` });
    for (const m of visible(html).matchAll(/C\/D RATING:\s*([\d.]+)\s*\/\s*10\s+(\d{4})\s/g)) {
      if (m[2] !== year) found.push({ model_year: m[2], value: Number(m[1]), ...base, note: `Listed among earlier model years on the page titled '${title}'.` });
    }
  } else {
    const now = ldRating(html, 'aggregateRating');
    if (now != null) found.push({ model_year: year, value: now, ...base, note: `MotorTrend score in the page's review data; page titled '${title}'.` });
  }
  if (!found.length) report.push(`no rating   ${pg.model} ${pg.site} ${year} ('${title}')`);
  const sites = byModel.get(pg.model) ?? byModel.set(pg.model, {}).get(pg.model);
  const list = (sites[pg.site] ??= []);
  // A model year's own page outranks a mention of it on another year's page.
  for (const r of found) if (!list.some((x) => x.model_year === r.model_year)) list.push(r);
}

for (const model of new Set(pages.map((p) => p.model))) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [y, e] of Object.entries(m.years)) {
    delete e.ratings;
    if (!Object.keys(e).length) delete m.years[y];
  }
  for (const [site, list] of Object.entries(byModel.get(model) ?? {})) {
    for (const { model_year, ...r } of list) {
      // `ratings` goes ahead of the year's `links`, which stay last.
      const { links, ...rest } = m.years[model_year] ?? {};
      m.years[model_year] = { ...rest, ratings: { ...rest.ratings, [site]: r }, ...(links ? { links } : {}) };
    }
  }
  writeJson(file, m);
}

// Coverage: does each site rate the line's newest model year, the one the site shows?
let cd = 0, mt = 0, n = 0;
for (const model of new Set(pages.map((p) => p.model))) {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'data', 'models', `${model}.json`), 'utf8'));
  const y = newestYear(m);
  const of = (site, year) => m.years[year]?.ratings?.[site];
  const has = (site) => !!of(site, y);
  const years = (site) => Object.keys(m.years).filter((x) => of(site, x)).sort().reverse().map((x) => `${x}:${of(site, x).value}`).join(' ') || '-';
  n++; if (has('caranddriver')) cd++; if (has('motortrend')) mt++;
  console.log(`${model.padEnd(28)} ${y}  C/D ${has('caranddriver') ? 'yes' : ' no'} [${years('caranddriver')}]  MT ${has('motortrend') ? 'yes' : ' no'} [${years('motortrend')}]`);
}
console.log(`\nRated for the newest model year:Car and Driver ${cd} of ${n}, MotorTrend ${mt} of ${n}`);
if (report.length) console.log(`\n${report.join('\n')}`);

// Rebuilds `price` in every listed model from Car and Driver's review pages: the same pages, from the
// same list (scripts/lists/ratings-pages.json), that ratings.js reads. A price is filed under its model
// year (years[year].price); a year nothing else describes yet holds only that. Every year's `price` is
// replaced wholesale, so edit the list, never a model file's `price`.
//
// The figure is the price range Car and Driver prints at the top of a review ("$36,900–$50,775"): new,
// cheapest trim to dearest. It is a ballpark for comparing cars, not a quote, and it is `secondary`:
// no maker's price list is read. The low end is often a two-wheel-drive trim. The model year is read
// from the page's own title, never from its address, and checked against the year in the link the
// price sits on (/cars-for-sale/new/<year>/…).
// Usage: node scripts/price.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');
const { newestYear } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'ratings-pages.json'), 'utf8')).filter((p) => p.site === 'caranddriver');

const retrieved = new Map(); // url -> date of its first HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , , url] = line.split('\t');
  if (status === '200' && !retrieved.has(url)) retrieved.set(url, date);
}

const titleOf = (html) => (html.match(/<title[^>]*>([^<]*)</i)?.[1] || '').replace(/\s+/g, ' ').trim();

const byModel = new Map();
const report = [];
for (const pg of pages) {
  const file = path.join(root, 'sources', `${pg.slug}.html`);
  if (!retrieved.has(pg.url) || !fs.existsSync(file)) { report.push(`not saved   ${pg.model} ${pg.url}`); continue; }
  const html = fs.readFileSync(file, 'utf8');
  const title = titleOf(html);
  const year = title.match(/^(\d{4}) /)?.[1];
  if (!year) { report.push(`no year     ${pg.model} ${pg.url} ('${title}')`); continue; }
  const link = html.match(/<a\b[^>]*id="review-article-price-link"[^>]*>([^<]*)</);
  const printed = link?.[1].trim();
  const figures = (printed?.match(/\$[\d,]+/g) || []).map((s) => Number(s.replace(/[$,]/g, '')));
  if (!figures.length) { report.push(`no price    ${pg.model} ${year} ('${title}')`); continue; }
  const linkYear = link[0].match(/href="[^"]*\/(\d{4})\//)?.[1];
  if (linkYear && linkYear !== year) { report.push(`year differs ${pg.model}: page titled ${year}, price link says ${linkYear}; left out`); continue; }
  const years = byModel.get(pg.model) ?? byModel.set(pg.model, {}).get(pg.model);
  if (years[year]) {
    if (years[year].printed !== printed) report.push(`two prices  ${pg.model} ${year}: kept '${years[year].printed}', ${pg.url} prints '${printed}'`);
    continue;
  }
  years[year] = {
    printed,
    price: {
      value: [Math.min(...figures), Math.max(...figures)],
      source: pg.url,
      retrieved: retrieved.get(pg.url),
      secondary: true,
      note: `Car and Driver's price range for a new one, as printed ('${printed}'); page titled '${title}'.`,
    },
  };
}

for (const model of new Set(pages.map((p) => p.model))) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [y, e] of Object.entries(m.years)) {
    delete e.price;
    if (!Object.keys(e).length) delete m.years[y];
  }
  for (const [year, { price }] of Object.entries(byModel.get(model) ?? {})) {
    // `price` goes ahead of the year's `ratings` and `links`, which stay last.
    const { ratings, links, ...rest } = m.years[year] ?? {};
    m.years[year] = { ...rest, price, ...(ratings ? { ratings } : {}), ...(links ? { links } : {}) };
  }
  writeJson(file, m);
}

// Coverage: is the line's newest model year, the one the site shows, priced?
let priced = 0, n = 0;
for (const model of new Set(pages.map((p) => p.model))) {
  const m = JSON.parse(fs.readFileSync(path.join(root, 'data', 'models', `${model}.json`), 'utf8'));
  const y = newestYear(m);
  const all = Object.keys(m.years).filter((x) => m.years[x].price).sort().reverse().map((x) => `${x}: ${m.years[x].price.value.map((v) => '$' + v.toLocaleString('en-US')).join('–')}`).join('   ') || '-';
  n++; if (m.years[y]?.price) priced++;
  console.log(`${model.padEnd(28)} ${y} ${m.years[y]?.price ? 'yes' : ' no'}  ${all}`);
}
console.log(`\nPriced for the newest model year: ${priced} of ${n}`);
if (report.length) console.log(`\n${report.join('\n')}`);

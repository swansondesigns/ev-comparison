// Rebuilds recalls in every listed model from NHTSA's recalls API. Each saved response answers one
// question, "recalls for this make, model name and model year"; they are listed in
// scripts/lists/recalls-pages.json and saved in sources/ by
// `node scripts/fetch-batch.js scripts/lists/recalls-pages.json 1.5`. A list entry is fetch-batch's
// { url, slug, ext } plus `model` (the model file), `model_year` and `name` (the model name asked for).
// Both fields are replaced wholesale, so edit the list, never a model file.
//
// A campaign usually covers several model years, so its text is kept once, on the line
// (recall_campaigns[<NHTSA campaign number>]), and each year lists the numbers that apply to it
// (years[year].recalls.campaigns, newest first) with the names asked. An empty list means NHTSA had none
// on the day it was read.
//
// Names. NHTSA files some cars under several names (Q6 e-tron and Q6 Sportback e-tron; five Macan
// Electrics), so a year can have several entries, merged here. It answers a name it doesn't know with
// "0 recalls", the same as a clean record, and its own model lists (scripts/lists/nhtsa-models.json,
// where the names were looked up) carry suffixes the recalls API doesn't accept. So a name counts only
// once it has returned a campaign for some year of the line; a year none of whose names has is left
// out and reported, never recorded as clean. A name shared with a petrol car (XC40, GLC) isn't asked.
//
// The park and over-the-air flags are NHTSA's own. The over-the-air one is not reliable: it is false on
// campaigns whose remedy text says the fix is sent over the air. Nothing here judges a recall.
// Usage: node scripts/recalls.js
const fs = require('fs');
const path = require('path');
const writeJson = require('./write-json');

const root = path.join(__dirname, '..');
const src = path.join(root, 'sources');
const pages = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'recalls-pages.json'), 'utf8'));

// fetch slug -> date of its latest answer in the log. NHTSA sends an empty answer as HTTP 400 with its
// usual body ("Count": 0, "Results returned successfully"), so a 400 counts once the body is checked.
const retrieved = new Map();
for (const line of fs.readFileSync(path.join(src, 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , slug] = line.split('\t');
  if (status === '200' || status === '400') retrieved.set(slug, date);
}
const OK = 'Results returned successfully';

const text = (s) => (s || '').replace(/\s+/g, ' ').trim();
const iso = (d) => d.split('/').reverse().join('-'); // NHTSA gives DD/MM/YYYY
function campaign(r, base) {
  const replaced = text(r.Remedy).match(/replaced by NHTSA recall number (\d{2}[A-Z])-?(\d{3})/i);
  return {
    date: iso(r.ReportReceivedDate),
    component: text(r.Component),
    summary: text(r.Summary),
    consequence: text(r.Consequence),
    remedy: text(r.Remedy),
    ...(replaced ? { replaced_by: `${replaced[1].toUpperCase()}${replaced[2]}000` } : {}),
    park_it: r.parkIt,
    park_outside: r.parkOutSide,
    over_the_air: r.overTheAirUpdate,
    ...base,
  };
}

const byModel = new Map();
const report = [];
for (const pg of pages) {
  const file = path.join(src, `${pg.slug}.json`);
  if (!retrieved.has(pg.slug) || !fs.existsSync(file)) { report.push(`not saved    ${pg.model} ${pg.model_year} '${pg.name}'`); continue; }
  let body = null;
  try { body = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* not JSON: a real error page */ }
  if (body?.Message !== OK || !Array.isArray(body.results)) { report.push(`bad answer   ${pg.model} ${pg.model_year} '${pg.name}' (sources/${pg.slug}.json)`); continue; }
  const found = body.results;
  const entry = byModel.get(pg.model) ?? byModel.set(pg.model, { years: {}, campaigns: {}, proven: new Set() }).get(pg.model);
  const base = { source: pg.url, retrieved: retrieved.get(pg.slug) };
  if (found.length) entry.proven.add(pg.name);
  (entry.years[pg.model_year] ??= []).push({ name: pg.name, base, ids: found.map((r) => r.NHTSACampaignNumber) });
  // Pages are listed oldest model year first, so a campaign's record cites the newest year it covers.
  for (const r of found) entry.campaigns[r.NHTSACampaignNumber] = campaign(r, base);
}

for (const [model, entry] of byModel) {
  const file = path.join(root, 'data', 'models', `${model}.json`);
  const m = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const [y, e] of Object.entries(m.years)) {
    delete e.recalls;
    if (!Object.keys(e).length) delete m.years[y];
  }
  delete m.recall_campaigns;

  const counts = [];
  for (const [year, asked] of Object.entries(entry.years)) {
    const good = asked.filter((a) => entry.proven.has(a.name));
    for (const a of asked) if (!entry.proven.has(a.name)) report.push(`unproven     ${model} ${year} '${a.name}': never returned a campaign for this line`);
    if (!good.length) { report.push(`left out     ${model} ${year}: no proven name, so "0 recalls" can't be told from a wrong name`); continue; }
    const ids = [...new Set(good.flatMap((a) => a.ids))].sort((a, b) => entry.campaigns[b].date.localeCompare(entry.campaigns[a].date) || b.localeCompare(a));
    const recalls = {
      campaigns: ids,
      asked: good.map((a) => ({ name: a.name, found: a.ids.length, ...a.base })),
      ...(ids.length ? {} : { note: 'NHTSA listed no recalls for this model year on the day it was read.' }),
    };
    // `recalls` goes ahead of the year's `price`, `ratings` and `links`, which stay last.
    const { price, ratings, links, ...rest } = m.years[year] ?? {};
    m.years[year] = { ...rest, recalls, ...(price ? { price } : {}), ...(ratings ? { ratings } : {}), ...(links ? { links } : {}) };
    counts.push(`${year}:${ids.length}`);
  }
  const used = new Set(Object.values(m.years).flatMap((e) => e.recalls?.campaigns || []));
  const recall_campaigns = Object.fromEntries(Object.entries(entry.campaigns).filter(([id]) => used.has(id))
    .sort(([a, x], [b, y]) => y.date.localeCompare(x.date) || b.localeCompare(a)));

  // The campaigns belong to the line, so they go ahead of `years`, `links` and `notes`, which stay last.
  const { years, links, notes, ...facts } = m;
  writeJson(file, { ...facts, ...(used.size ? { recall_campaigns } : {}), years, ...(links ? { links } : {}), ...(notes ? { notes } : {}) });
  console.log(`${model.padEnd(28)} ${counts.join('  ') || '-'}   (${used.size} campaigns)`);
}
if (report.length) console.log(`\n${report.join('\n')}`);

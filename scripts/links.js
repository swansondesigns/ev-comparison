// Rebuilds `links` in every listed model from scripts/lists/links.json: where the outbound buttons go
// (the maker's consumer page, Car and Driver, MotorTrend). null in the list means no page is known,
// and the site shows that button inert. The maker's page belongs to the line (`links.maker`); the review
// sites' pages are per model year and go under the line's newest (years[year].links). Both are replaced
// wholesale, so edit the list, never a model file's `links`.
//
// A link is recorded only once it has loaded. A URL with an HTTP 200 in sources/fetch-log.tsv takes that
// row's date. Any other is requested now, paced, and recorded with its status and page title; the body
// isn't kept, since nothing is cited from it. One that doesn't return 200 is left out and reported.
// A URL already recorded in the model file isn't requested again.
// Usage: node scripts/links.js [pauseSeconds]
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const writeJson = require('./write-json');
const { newestYear, resolve } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const list = JSON.parse(fs.readFileSync(path.join(__dirname, 'lists', 'links.json'), 'utf8'));
const pause = Number(process.argv[2] || 4) * 1000;
const KINDS = ['maker', 'caranddriver', 'motortrend'];

const fetched = new Map(); // url -> date of its first HTTP 200 in the log
for (const line of fs.readFileSync(path.join(root, 'sources', 'fetch-log.tsv'), 'utf8').trim().split('\n')) {
  const [date, status, , , url] = line.split('\t');
  if (status === '200' && !fetched.has(url)) fetched.set(url, date);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = new Date().toLocaleDateString('en-CA');
const tmp = path.join(os.tmpdir(), `link-check-${process.pid}.html`);

// The headers scripts/fetch.sh sends.
function check(url) {
  let status = '000';
  let landed = url;
  try {
    [status, landed] = execFileSync('curl', ['-sS', '-L', '--compressed', '--max-time', '40', '-o', tmp, '-w', '%{http_code} %{url_effective}',
      '-H', 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      '-H', 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
      '-H', 'Accept-Language: en-US,en;q=0.9',
      '-H', 'Upgrade-Insecure-Requests: 1',
      '-H', 'Sec-Fetch-Dest: document',
      '-H', 'Sec-Fetch-Mode: navigate',
      '-H', 'Sec-Fetch-Site: none',
      '-H', 'Sec-Fetch-User: ?1',
      url], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim().split(' ');
  } catch { /* curl's own failure: status stays 000 */ }
  const html = fs.existsSync(tmp) ? fs.readFileSync(tmp, 'utf8') : '';
  fs.rmSync(tmp, { force: true });
  const title = (html.match(/<title[^>]*>([^<]*)</i)?.[1] || '').replace(/&amp;/g, '&').replace(/&#0?39;|&apos;/g, "'").replace(/\s+/g, ' ').trim();
  return { status, title, landed };
}

(async () => {
  let asked = false;
  const failed = [];
  for (const [slug, targets] of Object.entries(list)) {
    const file = path.join(root, 'data', 'models', `${slug}.json`);
    const m = JSON.parse(fs.readFileSync(file, 'utf8'));
    const year = newestYear(m);
    if (!year) throw new Error(`${slug}: no model year to file the review links under`);
    const recorded = resolve(m, year).links;
    const links = {};
    for (const kind of KINDS) {
      const url = targets[kind];
      if (!url) continue;
      const prior = recorded[kind];
      if (prior?.url === url) { links[kind] = prior; continue; }
      if (fetched.has(url)) {
        links[kind] = { url, retrieved: fetched.get(url), note: 'Saved in sources/ (fetch-log.tsv).' };
        continue;
      }
      if (asked) await sleep(pause);
      asked = true;
      const { status, title, landed } = check(url);
      // A year-less address that forwards to the current model year is the one to keep.
      const moved = landed.replace(/\/$/, '') !== url.replace(/\/$/, '') ? ` Redirects to ${landed}.` : '';
      console.log(`${status} ${slug} ${kind}  ${title}${moved}`);
      if (status === '200') links[kind] = { url, retrieved: today, note: `Loaded, not saved: HTTP 200, titled '${title}'.${moved}` };
      else failed.push(`${status} ${slug} ${kind} ${url}`);
    }
    const { maker, ...review } = links;
    for (const e of Object.values(m.years)) delete e.links;
    if (Object.keys(review).length) m.years[year].links = review; // last in its year
    delete m.links;
    // `links` goes ahead of `notes`, which stays last.
    const { notes, ...rest } = m;
    writeJson(file, { ...rest, ...(maker ? { links: { maker } } : {}), ...(notes ? { notes } : {}) });
  }
  if (failed.length) console.log(`\nNot recorded:\n${failed.join('\n')}`);
})();

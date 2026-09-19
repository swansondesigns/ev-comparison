// Fetch a list of pages one at a time, pausing between requests.
// Usage: node scripts/fetch-batch.js <list.json> [pauseSeconds]
// list.json: [{ "url": "...", "slug": "...", "ext": "xml" }, ...]   (ext optional, defaults to html)
// Skips slugs already saved with HTTP 200 in sources/fetch-log.tsv.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.join(__dirname, '..');
const list = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const pause = Number(process.argv[3] || 4) * 1000;
const logFile = path.join(root, 'sources', 'fetch-log.tsv');

const done = new Set(
  (fs.existsSync(logFile) ? fs.readFileSync(logFile, 'utf8') : '')
    .trim().split('\n').map((l) => l.split('\t')).filter((r) => r[1] === '200').map((r) => r[3])
);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  let first = true;
  for (const { url, slug, ext } of list) {
    if (done.has(slug)) { console.log(`skip ${slug}`); continue; }
    if (!first) await sleep(pause);
    first = false;
    const out = execFileSync('bash', [path.join(__dirname, 'fetch.sh'), url, slug, ext || 'html'], { encoding: 'utf8' });
    process.stdout.write(out);
  }
})();

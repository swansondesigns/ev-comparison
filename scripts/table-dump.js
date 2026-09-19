// Print the rows of every HTML table in a saved page, cells separated by ' | '.
// Usage: node scripts/table-dump.js <saved page> [row regex]
const fs = require('fs');

const [file, filter = '.'] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');
const re = new RegExp(filter, 'i');
const text = (s) => s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
  .replace(/&#39;|&rsquo;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ').trim();

for (const [, row] of html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
  const cells = [...row.matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) => text(c[1]));
  const line = cells.join(' | ');
  if (cells.length && re.test(line)) console.log(line);
}

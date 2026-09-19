// Print text snippets around keyword matches in a saved page.
// Usage: node scripts/peek.js <file> <regex> [contextChars]
// Example: node scripts/peek.js sources/x.html "length|width|NACS" 120
const fs = require('fs');

const [file, pattern, ctx = '120'] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');
const text = html
  .replace(/<(script|style|svg|noscript)[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' | ')
  .replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&#8217;|&rsquo;/g, "'").replace(/&quot;|&#8221;|&#8220;/g, '"')
  .replace(/\s+/g, ' ')
  .replace(/( \| )+/g, ' | ');

const title = (html.match(/<title[^>]*>([^<]*)/) || [])[1];
console.log(`[${file}] ${title || ''} (${text.length} chars of text)`);
const re = new RegExp(pattern, 'gi');
const n = Number(ctx);
let m, last = -Infinity, count = 0;
while ((m = re.exec(text)) && count < 60) {
  if (m.index < last + n) continue; // skip overlapping snippets
  last = m.index;
  count++;
  console.log('…' + text.slice(Math.max(0, m.index - n), m.index + n) + '…');
}
if (!count) console.log('(no matches)');

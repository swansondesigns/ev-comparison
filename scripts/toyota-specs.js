// Print the spec table embedded in a saved toyota.com features page, one line per trim and label.
// Usage: node scripts/toyota-specs.js <saved page> [label regex]
// The page carries JSON shaped { <category>: { grades: { <trim>: { ... { label, value, icon } } } } }.
// icon is 'standard', 'available', 'not-available' or 'false' (a plain value row).
const fs = require('fs');

const [file, filter = '.'] = process.argv.slice(2);
const html = fs.readFileSync(file, 'utf8');
const re = new RegExp(filter, 'i');
const strip = (s) => s.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

let category = '', grade = '';
const seen = new Set();
const token = /"([a-z_]+)":\{"grades"|"([a-z0-9-]+_[a-z0-9_]+)":\{"image"|"label":"((?:[^"\\]|\\.)*)","labeldescription":"(?:[^"\\]|\\.)*","value":"((?:[^"\\]|\\.)*)","valuedescription":"(?:[^"\\]|\\.)*","icon":"([^"]*)"/g;
for (const m of html.matchAll(token)) {
  if (m[1]) { category = m[1]; continue; }
  if (m[2]) { grade = m[2]; continue; }
  const label = strip(JSON.parse(`"${m[3]}"`));
  const value = strip(JSON.parse(`"${m[4]}"`));
  if (!re.test(label)) continue;
  const line = `${category} | ${grade} | ${label} | ${value || '-'} | ${m[5]}`;
  if (!seen.has(line)) { seen.add(line); console.log(line); }
}

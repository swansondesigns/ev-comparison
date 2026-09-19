// Write JSON in the model files' hand-formatted style: 2-space indent, with arrays of primitives
// and all-primitive objects inside arrays kept on one line.
const fs = require('fs');

const prim = (v) => v === null || typeof v !== 'object';
const inline = (v) => JSON.stringify(v, null, 1).replace(/\n\s*/g, ' ').replace(/\[ /g, '[').replace(/ \]/g, ']');

function fmt(v, pad, inArray) {
  if (prim(v)) return JSON.stringify(v);
  if (Array.isArray(v)) {
    if (!v.length || v.every(prim)) return `[${v.map((x) => JSON.stringify(x)).join(', ')}]`;
    return `[\n${v.map((x) => pad + '  ' + fmt(x, pad + '  ', true)).join(',\n')}\n${pad}]`;
  }
  if (inArray && Object.values(v).every(prim)) return inline(v);
  const keys = Object.keys(v);
  return `{\n${keys.map((k) => `${pad}  ${JSON.stringify(k)}: ${fmt(v[k], pad + '  ', false)}`).join(',\n')}\n${pad}}`;
}

module.exports = (file, obj) => fs.writeFileSync(file, fmt(obj, '', false) + '\n');

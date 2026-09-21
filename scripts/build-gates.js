// Apply the gates to data/models/*.json and write data/gates.md. Each line is judged on its newest model year.
// Usage: node scripts/build-gates.js
const fs = require('fs');
const path = require('path');
const { resolve } = require('../src/lib/model.mjs');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'data', 'models');
const models = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
  .map((f) => ({ file: f, ...resolve(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))) }));

// Gate rules live in src/lib/gates.mjs so the site and this report can't disagree.
const { COROLLA, SIZE_REFERENCE, val, gates } = require('../src/lib/gates.mjs');
const ref = models.find((m) => m.file === `${SIZE_REFERENCE}.json`);
const REF = { length_in: val(ref.length_in), width_in: val(ref.width_in) };

const delta = (a, b) => (a == null || b == null ? '?' : (a - b > 0 ? '+' : '') + (a - b).toFixed(1));

// A model needs a human when a gate input is missing or any field is flagged as a conflict.
const FIELDS = ['length_in', 'width_in', 'awd', 'supercharger_access'];
function problems(m, g) {
  const p = [];
  for (const f of FIELDS) {
    if (!m[f] || m[f].value == null) p.push(`${f}: missing${m[f] && m[f].note ? ' (' + m[f].note + ')' : ''}`);
    else if (m[f].conflict) p.push(`${f}: sources disagree (${m[f].conflict})`);
  }
  if (Object.values(g).includes('?') && !p.length) p.push('a gate could not be decided');
  return p;
}

const rows = models.map((m) => {
  const g = gates(m);
  return { m, g, p: problems(m, g) };
}).sort((a, b) => (val(a.m.length_in) ?? 1e9) - (val(b.m.length_in) ?? 1e9));

const port = (m) => {
  const sc = m.supercharger_access;
  if (!sc || sc.value == null) return '?';
  if (sc.value === 'no') return 'no access';
  if (sc.via === 'port') return 'built-in port';
  const a = m.charge_port && m.charge_port.adapter;
  const yrs = a && a.model_years ? ` (MY${a.model_years.join(', MY')})` : '';
  return a && a.value ? `adapter: ${a.value}${yrs}` : 'adapter';
};
const awdText = (m) => (m.awd && m.awd.value ? m.awd.value : '?');
const mark = (x) => ({ pass: '✅', fail: '❌', '?': '❓' }[x]);

const header = '| Model | Length | Width | vs Mach-E L / W | vs Corolla L / W | AWD | Tesla |\n|---|---|---|---|---|---|---|';
const line = ({ m, g }) => {
  const L = val(m.length_in), W = val(m.width_in);
  return `| ${m.make} ${m.model} | ${L ?? '?'} | ${W ?? '?'}${m.width_in && m.width_in.with_mirrors ? '*' : ''} | ${delta(L, REF.length_in)} / ${delta(W, REF.width_in)} | ${delta(L, COROLLA.length_in)} / ${delta(W, COROLLA.width_in)} | ${mark(g.awd)} ${awdText(m)} | ${mark(g.tesla)} ${port(m)} |`;
};

// Small disagreements between sources that can't change a gate: flagged, not blocking.
const minor = rows.flatMap(({ m }) => FIELDS.filter((f) => m[f] && m[f].discrepancy)
  .map((f) => `- **${m.make} ${m.model}**, ${f}: ${m[f].discrepancy}`));

const clean = rows.filter((r) => !r.p.length);
const human = rows.filter((r) => r.p.length);
const passing = clean.filter((r) => Object.values(r.g).every((x) => x === 'pass'));

const md = `# Gate results

Generated ${new Date().toISOString().slice(0, 10)} from \`data/models/*.json\` by \`scripts/build-gates.js\`.

**References.** Size guidance only, not cutoffs. 2000 Toyota Corolla sedan, her car: ${COROLLA.length_in} in long, ${COROLLA.width_in} in wide (verified in the handoff). ${ref.make} ${ref.model}, the one she said feels right: ${REF.length_in} in long, ${REF.width_in} in wide (${ref.length_in.source}).

**Gates.** 1) AWD offered on at least one trim. 2) Tesla: can charge at Tesla Superchargers today, with a built-in port or an adapter. Size is not a gate (ev-research-reply-2.md): every car here comes from compact and subcompact electric SUV lists, and she judges size herself. US sale status is not a gate; availability is out of scope.

Lengths and widths are inches. Deltas are candidate minus reference, so negative means smaller. Widths exclude mirrors unless marked * (the maker gave only a mirrors-folded or mirrors-included figure; see the model file). Where a maker didn't say whether its width includes mirrors, C/D's mirrorless figure agreed in every case checked.

## Both gates passed (${passing.length})

${passing.map((r) => `- ${r.m.make} ${r.m.model} (${val(r.m.length_in)} in, ${port(r.m)})`).join('\n') || '_None._'}

## All models with complete, agreeing data (${clean.length}), sorted by length

${header}
${clean.map(line).join('\n')}

## Needs a human (${human.length})

Missing or conflicting values. Gates shown where they could still be decided.

${human.length ? header + '\n' + human.map(line).join('\n') : '_None._'}

${human.map(({ m, g, p }) => {
  const failed = Object.entries(g).filter(([, v]) => v === 'fail').map(([k]) => k);
  const tag = failed.length ? ` _(Already fails ${failed.join(' and ')}, so this doesn't change the outcome.)_` : ' _(Could pass: this is an open question.)_';
  return `- **${m.make} ${m.model}:**${tag} ${p.join('; ')}`;
}).join('\n')}

## Minor source disagreements (${minor.length})

Recorded in the model files with both values. Too small to change any gate.

${minor.join('\n') || '_None._'}
`;

fs.writeFileSync(path.join(root, 'data', 'gates.md'), md);
console.log(`${rows.length} models: ${passing.length} pass both gates, ${human.length} need a human.`);

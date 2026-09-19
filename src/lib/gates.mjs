// Gate rules, shared by the site and scripts/build-gates.js.
// Size and AWD only. Sale status was dropped as a gate on 2026-09-19 (ev-build-instructions.md);
// us_status stays in the model files but nothing reads it.

export const COROLLA = { length_in: 174.0, width_in: 66.7 }; // 2000 Corolla sedan, verified in ev-research-handoff.md

export const val = (f) => (f && f.value != null ? f.value : null);

// The Toyota bZ is the size ceiling. Its file carries "reference": true.
export const findReference = (models) => models.find((m) => m.reference);

// Each gate is 'pass', 'fail' or '?' (no data). A '?' must never render as a pass or a fail.
export function gates(m, bz) {
  const len = val(m.length_in);
  const size = len == null ? '?' : len < val(bz.length_in) ? 'pass' : 'fail';
  const awdV = val(m.awd);
  const awd = awdV == null ? '?' : awdV === 'none' ? 'fail' : 'pass';
  return { size, awd };
}

export const passes = (g) => Object.values(g).every((x) => x === 'pass');

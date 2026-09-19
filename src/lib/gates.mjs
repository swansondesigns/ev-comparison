// Gate rules, shared by the site and scripts/build-gates.js.
// AWD and Tesla charging. Size stopped being a gate on 2026-09-19 (ev-research-reply-2.md): she judges
// size herself, so no length cutoff applies and no model is special-cased. Sale status was dropped
// earlier the same day (ev-build-instructions.md); us_status stays in the model files but nothing reads it.

export const COROLLA = { length_in: 174.0, width_in: 66.7 }; // 2000 Corolla sedan, verified in ev-research-handoff.md

// The car she said feels the right size. A reference line on the length track, not a cutoff.
export const SIZE_REFERENCE = 'ford-mustang-mach-e';

export const val = (f) => (f && f.value != null ? f.value : null);

// Each gate is 'pass', 'fail' or '?' (no data). A '?' must never render as a pass or a fail.
export function gates(m) {
  const awdV = val(m.awd);
  const awd = awdV == null ? '?' : awdV === 'none' ? 'fail' : 'pass';
  // Can it charge at Tesla Superchargers today, with a built-in port or an adapter.
  const sc = val(m.supercharger_access);
  const tesla = sc == null ? '?' : sc === 'no' ? 'fail' : 'pass';
  return { awd, tesla };
}

export const passes = (g) => Object.values(g).every((x) => x === 'pass');

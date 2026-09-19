// Page two's view of the models that pass both gates. Everything here is read from the data files;
// the only arithmetic is width minus the Corolla's width and the min/max of EPA figures.
import { val, COROLLA } from './gates.mjs';
import { models, bz, byMakeModel } from './data.js';

const awdText = (m) =>
  m.awd.value === 'standard' ? 'All trims' : m.awd.label ?? (m.awd.trims || []).join(', ');

// "Built in" for a NACS port, "Adapter" for CCS1. Adapter inclusion only where the maker says so,
// and only for the model years it names.
function plug(m) {
  const cp = m.charge_port;
  if (!cp || cp.value == null) return null;
  if (cp.value === 'NACS') return { text: 'Built in' };
  const a = cp.adapter || {};
  if (a.value === 'not supported') return { text: 'Not yet', note: 'maker says no adapter works', warn: true };
  if (a.value !== 'included') return { text: 'Adapter' };
  const yrs = a.model_years;
  if (yrs && !yrs.includes(m.model_year?.value)) return { text: 'Adapter', note: `included with ${yrs.join(', ')} models` };
  return { text: 'Adapter', note: 'included with the car' };
}

function widthText(w) {
  if (w == null) return null;
  const d = Math.round((w - COROLLA.width_in) * 10) / 10;
  return d === 0 ? 'same width' : `${Math.abs(d).toFixed(1)} in ${d > 0 ? 'wider' : 'narrower'}`;
}

// EPA range across AWD versions only; FWD and RWD versions fail her must-have.
function range(m) {
  const awd = (m.epa_range?.entries || []).filter((e) => e.drive === 'AWD' && e.value != null);
  if (!awd.length) return null;
  const vals = awd.map((e) => e.value);
  return { min: Math.min(...vals), max: Math.max(...vals), estimate: awd.some((e) => e.estimate) };
}

const alpha = [...models].sort(byMakeModel).map((m) => m.slug);

export const rows = models
  .filter((m) => m.pass && !m.reference)
  .map((m) => ({
    slug: m.slug,
    name: m.name,
    year: m.model_year?.value ?? null,
    length: val(m.length_in),
    width: widthText(val(m.width_in)),
    awd: awdText(m),
    plug: plug(m),
    range: range(m),
    alpha: alpha.indexOf(m.slug),
  }))
  .sort((a, b) => (a.length ?? 1e9) - (b.length ?? 1e9));

export const refs = { corolla: COROLLA.length_in, bz: val(bz.length_in) };

// Round scale bounds from the data. Positions are percentages along a track.
const lengths = [...rows.map((r) => r.length), refs.corolla, refs.bz].filter((x) => x != null);
export const sizeScale = {
  lo: Math.floor((Math.min(...lengths) - 1) / 5) * 5,
  hi: Math.ceil((Math.max(...lengths) + 1) / 5) * 5,
};

const ranges = rows.flatMap((r) => (r.range ? [r.range.min, r.range.max] : []));
const RANGE_STEP = 50;
export const rangeScale = {
  lo: Math.floor(Math.min(...ranges) / RANGE_STEP) * RANGE_STEP,
  hi: Math.ceil(Math.max(...ranges) / RANGE_STEP) * RANGE_STEP,
  tick: 25,
  labelEvery: RANGE_STEP,
};

export const pct = (v, s) => `${(((v - s.lo) / (s.hi - s.lo)) * 100).toFixed(2)}%`;

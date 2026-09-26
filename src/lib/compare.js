// The view of the models that pass both gates, shared by page two and the one-sheets. Everything here
// is read from the data files; the only arithmetic is a dimension minus a reference car's and the
// min/max of EPA figures.
import { val, COROLLA, SIZE_REFERENCE } from './gates.mjs';
import { cheapestAwdRange } from './cheapest.mjs';
import { models, byMakeModel } from './data.js';
import { outLinks } from './links.js';

export const awdText = (m) =>
  m.awd.value === 'standard' ? 'All trims' : m.awd.label ?? (m.awd.trims || []).join(', ');

// "Built in" or "Adapter", from how the model reaches Superchargers. Adapter inclusion only where the
// maker says so, and only for the model years it names. `detail` adds "sold separately" for the one-sheets.
export function plug(m) {
  const via = m.supercharger_access?.via;
  if (!via) return null;
  if (via === 'port') return { text: 'Built in', detail: 'built-in port, no adapter needed' };
  const a = m.charge_port?.adapter || {};
  if (a.value !== 'included') {
    return { text: 'Adapter', detail: /^sold/.test(a.value ?? '') ? 'sold separately' : null };
  }
  const yrs = a.model_years;
  if (yrs && !yrs.includes(m.year)) {
    const note = `included with ${yrs.join(', ')} models`;
    return { text: 'Adapter', note, detail: note };
  }
  return { text: 'Adapter', note: 'included with the car', detail: 'included with the car' };
}

// "4.5 in wider" against a reference dimension. `same` names the dimension for the zero case.
function deltaText(v, ref, [more, less], same) {
  if (v == null || ref == null) return null;
  const d = Math.round((v - ref) * 10) / 10;
  return d === 0 ? same : `${Math.abs(d).toFixed(1)} in ${d > 0 ? more : less}`;
}
export const widthText = (w, ref = COROLLA.width_in) => deltaText(w, ref, ['wider', 'narrower'], 'same width');
// Page two prints the difference as a bare number under an "inches wider" subhead; narrower is negative.
export const widthDelta = (w, ref = COROLLA.width_in) => (w == null ? null : Math.round((w - ref) * 10) / 10);
// A width the maker gives only with mirrors can't be set against a mirrorless one, so it is printed as is.
const MIRRORS = { folded: 'mirrors folded', true: 'with mirrors' };
export const mirrorsText = (m) => (m.width_in?.with_mirrors ? MIRRORS[m.width_in.with_mirrors] ?? 'with mirrors' : null);
export const lengthText = (l, ref) => deltaText(l, ref, ['longer', 'shorter'], 'same length');

// EPA range across AWD versions only; FWD and RWD versions fail her must-have.
export const awdRanges = (m) => (m.epa_range?.entries || []).filter((e) => e.drive === 'AWD' && e.value != null);
// She is considering only the cheapest AWD version, so its own EPA figure where it can be told apart
// (cheapest.mjs); where it can't, the spread across AWD versions, with `spread` set so the page says so.
export function range(m) {
  const own = cheapestAwdRange(m);
  if (own) return { min: own.value, max: own.value, estimate: own.estimate, spread: false };
  const awd = awdRanges(m);
  if (!awd.length) return null;
  const vals = awd.map((e) => e.value);
  const [min, max] = [Math.min(...vals), Math.max(...vals)];
  return { min, max, estimate: awd.some((e) => e.estimate), spread: min !== max };
}
// One site's rating for the model year the row quotes. The sites score each model year separately, so
// another year's score never stands in for it; the others ride along for the info button.
export function rating(m, site) {
  const of = (y) => m.years[y]?.ratings?.[site];
  const own = of(m.year);
  const others = Object.keys(m.years).filter((y) => y !== m.year && of(y)).sort().reverse();
  return {
    value: own?.value ?? null,
    ratedAs: (own ?? of(others[0]))?.rated_as ?? null,
    others: others.map((y) => ({ year: y, value: of(y).value })),
  };
}

// Bare figures: page two prints the unit under them.
export const rangeText = (r) => (r.min === r.max ? `${r.min}` : `${r.min}–${r.max}`);

// What the cheapest all-wheel-drive version cost new that model year, delivery included, per Car and
// Driver (scripts/price.js), and that version's name. C/D's names carry build codes and market tags
// ("Luxury AWD 4dr w/1SC", "XLE AWD (Natl)"); `trim` drops those for display.
const money = (v) => `$${v.toLocaleString('en-US')}`;
const tidyTrim = (t) => t.replace(/\s*\(Natl\)|\s*\*Ltd Avail\*|\s+4dr\b|\s+w\/[0-9A-Z]{3}\b/g, '').replace(/\s+/g, ' ').trim();
export function price(m) {
  if (m.price?.value == null) return null;
  return { value: m.price.value, text: money(m.price.value), trim: tidyTrim(m.price.trim ?? '') };
}

const alpha = [...models].sort(byMakeModel).map((m) => m.slug);

export const passers = models.filter((m) => m.pass);

export const rows = passers
  .map((m) => ({
    slug: m.slug,
    name: m.name,
    year: m.year,
    length: val(m.length_in),
    // A width given only with mirrors can't be compared, so it gets its figure in words, not a delta.
    widthDelta: mirrorsText(m) ? null : widthDelta(val(m.width_in)),
    widthNote: mirrorsText(m) ? `${val(m.width_in)} wide, ${mirrorsText(m)}` : null,
    plug: plug(m),
    range: range(m),
    price: price(m),
    cd: rating(m, 'caranddriver'),
    mt: rating(m, 'motortrend'),
    out: outLinks(m),
    alpha: alpha.indexOf(m.slug),
  }))
  .sort((a, b) => (a.length ?? 1e9) - (b.length ?? 1e9));

// Her two size references: the car she drives and the one she said feels right. Guidance, not cutoffs.
const feelsRight = models.find((m) => m.slug === SIZE_REFERENCE);
export const refs = {
  corolla: COROLLA.length_in,
  feelsRight: val(feelsRight?.length_in),
  feelsRightWidth: val(feelsRight?.width_in),
  feelsRightSlug: SIZE_REFERENCE,
};

// Round scale bounds from the data. Positions are percentages along a track.
const lengths = [...rows.map((r) => r.length), refs.corolla, refs.feelsRight].filter((x) => x != null);
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
export const rangeTicks = [];
for (let v = rangeScale.lo; v <= rangeScale.hi; v += rangeScale.tick) rangeTicks.push(v);

export const pct = (v, s) => `${(((v - s.lo) / (s.hi - s.lo)) * 100).toFixed(2)}%`;

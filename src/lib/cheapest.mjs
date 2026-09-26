// The EPA range of the cheapest all-wheel-drive version, the one a year's `price` names. Shared by the
// site and scripts/price.js (which prints each match), like gates.mjs.
//
// EPA labels its entries by wheel size, battery, charger or trim, in its own words or the maker's
// (`applies_to`), never in Car and Driver's version name, so the match is made on the words the two
// share. A label's words leave out the make and model, the makers' AWD words (quattro, 4MATIC, xDrive,
// ALL4, e-4ORCE) and its wheel or tire size, which is kept aside. The entries first narrow to the
// version's body where EPA splits them (Sportback or not), and drop any that name a wheel size other
// than the version's (from its C/D page); then, in this order, a match is taken only when it leaves a
// single figure:
//   1. every one of those entries has the same range;
//   2. an entry's label (or one of its maker trim names) has exactly the version's words;
//   3. an entry's label has no words the version's name lacks (it names no other trim, battery or
//      variant);
//   4. of those, when each names a wheel size, the one with the version's.
// Anything else is left unmatched, and the pages show the spread across AWD versions instead.
const WHEEL = /(\d{2})\s*(?:-?\s*in(?:ch)?(?![a-z])\.?|")/i;
const GENERIC = new Set(['awd', 'eawd', 'quattro', '4matic', 'xdrive', 'all4', 'e-4orce', 'with', 'w', 'wheel', 'wheels', 'tire', 'tires',
  'all-season', 'all-terrain', 'summer', '4dr', 'natl', '*ltd', 'avail*']);

function wordsOf(label, line) {
  const own = new Set(`${line.make} ${line.model}`.toLowerCase().split(/\s+/));
  const isLine = (w) => own.has(w) || [...own].some((o) => o.length >= 2 && w.startsWith(o));
  return new Set(label.toLowerCase().replace(new RegExp(WHEEL.source, 'gi'), ' ').replace(/[(),/]/g, ' ')
    .split(/\s+/).filter((w) => w && !GENERIC.has(w) && !isLine(w)));
}
const wheelOf = (label) => Number(label.match(WHEEL)?.[1]) || null;
const sportback = (s) => /sportback/i.test(s);
const subset = (a, b) => [...a].every((w) => b.has(w));
const equal = (a, b) => a.size === b.size && subset(a, b);

export function cheapestAwdRange(year) {
  const every = (year.epa_range?.entries || []).filter((e) => e.drive === 'AWD' && e.value != null);
  const trim = year.price?.trim;
  if (!every.length || !trim) return null;
  const label = (e) => e.applies_to || e.epa_vehicle || '';
  const w = year.price.wheels_in;
  const sameBody = every.filter((e) => sportback(label(e)) === sportback(trim));
  const body = sameBody.length ? sameBody : every;
  const awd = body.filter((e) => !w || !wheelOf(label(e)) || wheelOf(label(e)) === w);
  if (!awd.length) return null;
  const one = (list, how) => (list.length && new Set(list.map((e) => e.value)).size === 1
    ? { value: list[0].value, estimate: list.some((e) => e.estimate), how, entries: list.map(label) }
    : null);

  // All agreeing before anything was dropped is every AWD version; after, it's what narrowed them.
  const narrowed = [body.length < every.length && 'body', awd.length < body.length && 'wheel size'].filter(Boolean).join(' and ');
  const all = one(awd, narrowed || 'every AWD version');
  if (all) return all;
  const v = wordsOf(trim, year);
  // An empty name (Tesla's plain "AWD") matches a label with no words only if the label isn't just a wheel size.
  const named = one(awd.filter((e) => [label(e), ...(e.applies_to || '').split(/,\s*/)].some((l) =>
    equal(wordsOf(l, year), v) && (v.size || !wheelOf(l)))), 'name');
  if (named) return named;
  const plain = awd.filter((e) => subset(wordsOf(label(e), year), v));
  const byLabel = one(plain, 'label');
  if (byLabel) return byLabel;
  if (w && plain.length && plain.every((e) => wheelOf(label(e)))) return one(plain.filter((e) => wheelOf(label(e)) === w), `${w}-inch wheels`);
  return null;
}

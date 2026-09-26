// A one-sheet's view of one model. Everything is read from the model file. The four things she asked
// for come first; extras are listed only where the file has them, and a missing one is left off silently
// (ev-research-reply-2.md). Ground clearance is kept in the data and not shown.
import { val, COROLLA } from './gates.mjs';
import { awdText, plug, awdRanges, range, price, widthText, lengthText, mirrorsText, refs } from './compare.js';
import { cheapestAwdRange } from './cheapest.mjs';
import { outLinks } from './links.js';
import { resolve } from './model.mjs';

const GENERIC = /^all (trims|versions)$/i;
const scope = (e, many) => {
  const s = (e.applies_to || '').replace(/\s*\(tested by C\/D\)/, ''); // the attribution already says so
  return s && (many || !GENERIC.test(s)) ? s : null;
};
const cd = (f) => (f?.secondary ? 'Car and Driver' : null);

// Each extra is { label, lines: [{ text, scope?, via? }] }. `via` attributes a figure that isn't the maker's.
function extras(m) {
  const out = [];
  const push = (label, lines) => { if (lines.length) out.push({ label, lines }); };
  const each = (field, fn) => {
    const list = (field?.entries || []).filter((e) => fn(e) != null);
    return list.map((e) => ({ text: fn(e), scope: scope(e, list.length > 1), via: cd(e) }));
  };

  push('Battery', each(m.battery, (e) => (e.kwh == null ? null : `${e.kwh} kWh${['usable', 'gross'].includes(e.basis) ? ` ${e.basis}` : ''}`)));
  push('Peak DC charging rate', each(m.dc_peak_kw, (e) => (e.value == null ? null : `${e.value} kW`)));
  push('10–80% charge', each(m.dc_10_80, (e) => (e.minutes == null ? null
    : `${e.minutes} min${e.charger_kw ? ` on a ${e.charger_kw} kW charger` : ', charger not stated'}`)));
  // "unknown" must never read as "no", so it is left off.
  push('Heat pump', each(m.heat_pump, (e) => ({
    standard: 'Standard',
    optional: `Optional${e.package ? `, in the ${e.package}` : ''}`,
    'not offered': 'Not offered',
  }[e.value] ?? null)));

  const c = m.cargo_cu_ft;
  if (c && (c.seats_up != null || c.seats_down != null)) {
    const parts = [c.seats_up != null && `${c.seats_up} cu ft behind the rear seats`, c.seats_down != null && `${c.seats_down} cu ft with them folded`];
    push('Cargo', [{ text: parts.filter(Boolean).join(', '), via: cd(c) }]);
  }
  if (val(m.height_in) != null) push('Height', [{ text: `${val(m.height_in)} in`, via: cd(m.height_in) }]);
  const t = m.turning_circle_ft;
  if (t && (t.value != null || t.radius_ft != null)) {
    push('Turning circle', [{ text: t.value != null ? `${t.value} ft` : `${t.radius_ft} ft radius`, via: cd(t) }]);
  }
  const w = m.warranty;
  if (w) push('Warranty', [w.battery?.text, w.powertrain?.text].filter(Boolean).map((text) => ({ text })));
  push('Highway range test', (m.highway_tests || []).filter((h) => h.result_mi != null).map((h) => ({
    text: `${h.result_mi} mi at 75 mph${h.temp_f != null ? `, ${h.temp_f}°F` : ''}`,
    scope: h.trim_tested,
    via: 'Car and Driver',
  })));
  return out;
}

// The line's model years from 2024 on, the ones she'd shop new or used, newest first: what's on file
// for each, and what isn't. Each row is the cheapest all-wheel-drive version, the one she's considering:
// its name and price where Car and Driver has them, else just whether AWD is offered. A blank is
// something not found, never something the car lacks, so each year also lists its blanks by name for
// the nudge under the table.
const FLOOR = 2024;
const AWD_WORDS = { standard: 'On every trim', available: 'On some trims', none: 'None' };
const YEAR_FIELDS = ['price', 'epa_range', 'awd', 'charge_port', 'supercharger_access']; // what a row shows
function years(m) {
  return Object.keys(m.years).filter((y) => Number(y) >= FLOOR).sort().reverse().map((y) => {
    const v = resolve(m.line, y);
    const p = price(v);
    const row = { year: y, current: y === m.year, price: p, version: p?.trim || null, awd: AWD_WORDS[v.awd?.value] ?? null, range: range(v), plug: plug(v) };
    row.missing = [!row.awd && 'AWD', !row.price && 'price', !row.range && 'range', !row.plug && 'Tesla charging'].filter(Boolean);
    return row;
  });
}

// Every source URL behind what the sheet shows, with the fields it backs.
const SOURCE_FIELDS = {
  length_in: 'Length', width_in: 'Width', awd: 'AWD', charge_port: 'Charge port', supercharger_access: 'Tesla charging',
  epa_range: 'EPA range', price: 'Price', battery: 'Battery', dc_peak_kw: 'Peak DC charging rate', dc_10_80: '10–80% charge',
  heat_pump: 'Heat pump', cargo_cu_ft: 'Cargo', height_in: 'Height', turning_circle_ft: 'Turning circle',
  warranty: 'Warranty', highway_tests: 'Highway range test',
};
function sources(m, otherYears) {
  const byUrl = new Map();
  const walk = (node, label) => {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) return node.forEach((n) => walk(n, label));
    if (typeof node.source === 'string') {
      const s = byUrl.get(node.source) ?? { url: node.source, retrieved: node.retrieved ?? null, fields: [] };
      if (!s.fields.includes(label)) s.fields.push(label);
      byUrl.set(node.source, s);
    }
    Object.values(node).forEach((v) => walk(v, label));
  };
  for (const [key, label] of Object.entries(SOURCE_FIELDS)) walk(m[key], label);
  // The other years' rows show only what those years say for themselves.
  for (const y of otherYears) for (const key of YEAR_FIELDS) walk(m.line.years[y]?.[key], `${SOURCE_FIELDS[key]} (${y})`);
  return [...byUrl.values()];
}

export function sheet(m) {
  const length = val(m.length_in);
  const width = val(m.width_in);
  // A width that includes mirrors can't be set against a mirrorless one, so it gets no comparison.
  const mirrors = mirrorsText(m);
  const isRef = m.slug === refs.feelsRightSlug;
  const readerNotes = (m.notes || []).filter((n) => n.tag === 'reader');
  const p = price(m);
  const yrs = years(m);
  // The range bar(s) that belong to the cheapest AWD version, where they can be told apart.
  const own = cheapestAwdRange(m);

  return {
    slug: m.slug,
    make: m.make,
    model: [m.model, m.flair].filter(Boolean).join(' '),
    year: m.year,
    out: outLinks(m),
    isRef,
    size: {
      length,
      width,
      mirrors,
      vsCorolla: [lengthText(length, COROLLA.length_in), mirrors ? null : widthText(width)].filter(Boolean),
      vsFeelsRight: isRef ? [] : [lengthText(length, refs.feelsRight), mirrors ? null : widthText(width, refs.feelsRightWidth)].filter(Boolean),
    },
    awd: { text: awdText(m), standard: m.awd.value === 'standard' },
    tesla: plug(m),
    ranges: awdRanges(m).map((e) => {
      const label = e.applies_to ?? e.epa_vehicle;
      return { label, value: e.value, estimate: !!e.estimate, cheapest: !!own && own.how !== 'every AWD version' && own.entries.includes(label) };
    }),
    rangeYear: m.epa_range?.listing_year ?? null,
    price: p,
    years: yrs,
    // The years with a blank, for the nudge: where she can look for what the sheet couldn't find.
    gaps: yrs.filter((y) => y.missing.length),
    maker: { url: m.links?.maker?.url ?? null, name: m.make },
    extras: extras(m),
    // Notes addressed to a section render under it; the rest go in the Notes section.
    notesFor: (section) => readerNotes.filter((n) => n.section === section),
    notes: readerNotes.filter((n) => !n.section),
    sources: sources(m, yrs.filter((y) => !y.current).map((y) => y.year)),
  };
}

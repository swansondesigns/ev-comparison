// Site-relative links. One-sheets live at /cars/<slug>/, one per model that passes both gates.
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const sheetHref = (slug) => `${base}cars/${slug}/`;

// Outbound buttons: the same three for every car, in this order. A car with no page at one of them
// keeps the button, inert (href null), so the gap reads as "there isn't one" rather than an oversight.
const OUT = [
  ['maker', "Maker's site"],
  ['caranddriver', 'Car and Driver'],
  ['motortrend', 'MotorTrend'],
];
export const outLinks = (m) => OUT.map(([kind, label]) => ({ kind, label, href: m.links?.[kind]?.url ?? null }));

// A model file is one car line: what holds across its model years at the top, and under `years` what
// changes from one to the next (AWD trims, the plug, range, ratings, the review sites' pages). Shared
// by the site and the scripts, like gates.mjs.

// A year counts as a car once it has a gate fact. One that holds only a rating isn't one yet.
const GATE_FACTS = ['awd', 'supercharger_access'];
export const carYears = (line) =>
  Object.keys(line.years || {}).filter((y) => GATE_FACTS.some((k) => line.years[y][k])).sort().reverse();
export const newestYear = (line) => carYears(line)[0] ?? null;

// One model year of a line, flat: the line's facts with that year's over them, so a year can restate
// anything that changed (a facelift's length). `years` rides along for whatever lists the others.
export function resolve(line, year = newestYear(line)) {
  const { years = {}, ...shared } = line;
  const own = years[year] || {};
  return { ...shared, ...own, year, years, links: { ...shared.links, ...own.links } };
}

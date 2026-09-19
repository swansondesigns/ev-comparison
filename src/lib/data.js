// Loads data/models/*.json for the pages. Pages render from here only; no spec values in templates.
import { gates, passes, findReference } from './gates.mjs';

const files = import.meta.glob('../../data/models/*.json', { eager: true, import: 'default' });

const all = Object.entries(files).map(([file, m]) => ({
  slug: file.split('/').pop().replace(/\.json$/, ''),
  name: `${m.make} ${m.model}`,
  ...m,
}));

export const bz = findReference(all);

export const models = all.map((m) => {
  const g = gates(m, bz);
  return { ...m, gates: g, pass: passes(g) };
});

// Alphabetical by make, then model. Case-insensitive so Toyota bZ sorts before C-HR.
const cmp = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
export const byMakeModel = (a, b) => cmp(a.make, b.make) || cmp(a.model, b.model);

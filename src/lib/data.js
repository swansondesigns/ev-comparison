// Loads data/models/*.json for the pages. Pages render from here only; no spec values in templates.
import { gates, passes } from './gates.mjs';

const files = import.meta.glob('../../data/models/*.json', { eager: true, import: 'default' });

// Not data: a joke for the reader, shown after the model's name wherever the site prints it. It lives
// here so the sourced files, and the scripts that read them, never see it.
const FLAIR = { 'tesla-model-y': '🤮' };

export const models = Object.entries(files).map(([file, m]) => {
  const g = gates(m);
  const slug = file.split('/').pop().replace(/\.json$/, '');
  const flair = FLAIR[slug] ?? '';
  return {
    slug,
    name: [m.make, m.model, flair].filter(Boolean).join(' '),
    flair,
    ...m,
    gates: g,
    pass: passes(g),
  };
});

// Optional free-form body per model: data/models/<slug>.md, rendered at the bottom of its one-sheet
// for anything that doesn't fit the fields.
const bodies = import.meta.glob('../../data/models/*.md', { eager: true });
export const bodyFor = (slug) => bodies[`../../data/models/${slug}.md`]?.Content ?? null;

// Alphabetical by make, then model. Case-insensitive so Toyota bZ sorts before C-HR.
const cmp = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
export const byMakeModel = (a, b) => cmp(a.make, b.make) || cmp(a.model, b.model);

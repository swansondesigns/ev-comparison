// Row filtering for page two: a length trim and per-row hiding, both remembered in localStorage so
// the table comes back the way she left it. Rows are hidden with the `hidden` attribute, which leaves
// sorting alone.
const KEY = 'ev-research:compare:v1';
const NO_LENGTH = 1e9; // data-length of a row with no length; the trim never removes those

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; }
}
function save(state) {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* private mode: works for the visit */ }
}

// root holds the table, the trim ([data-trim] with two range inputs) and the status line
// ([data-filter-status]). Each body row carries data-slug and data-length, and a [data-hide] checkbox.
export function filterable(root) {
  const rows = [...root.querySelector('table').tBodies[0].rows];
  const trim = root.querySelector('[data-trim]');
  const [loIn, hiIn] = trim.querySelectorAll('input');
  const min = Number(loIn.min);
  const max = Number(loIn.max);
  const gap = Number(trim.dataset.minGap || 0);
  const status = root.querySelector('[data-filter-status]');
  const el = (name) => status.querySelector(`[data-${name}]`);

  const stored = load();
  const slugs = new Set(rows.map((r) => r.dataset.slug));
  const state = {
    hidden: (stored.hidden || []).filter((s) => slugs.has(s)),
    length: Array.isArray(stored.length) ? stored.length : [min, max],
  };
  let showHidden = false;

  function apply() {
    const [lo, hi] = state.length;
    loIn.value = lo;
    hiIn.value = hi;
    const pct = (v) => `${((v - min) / (max - min)) * 100}%`;
    trim.style.setProperty('--lo', pct(lo));
    trim.style.setProperty('--hi', pct(hi));

    let shown = 0;
    for (const row of rows) {
      const len = Number(row.dataset.length);
      const outside = len < NO_LENGTH && (len < lo || len > hi);
      const hiddenByHer = state.hidden.includes(row.dataset.slug);
      row.hidden = outside || (hiddenByHer && !showHidden);
      row.classList.toggle('is-hidden', hiddenByHer);
      row.querySelector('[data-hide]').checked = hiddenByHer;
      if (!outside && !hiddenByHer) shown++;
    }

    const trimmed = lo > min || hi < max;
    const hiddenCount = state.hidden.length;
    el('count').textContent = `Showing ${shown} of ${rows.length}`;
    el('trimmed').hidden = !trimmed;
    el('trim-text').textContent = `${lo}–${hi} in`;
    el('hidden-part').hidden = hiddenCount === 0;
    el('hidden-count').textContent = hiddenCount;
    el('toggle-hidden').textContent = showHidden ? 'Put them away' : 'Show them';
    el('toggle-hidden').setAttribute('aria-pressed', String(showHidden));
    el('reset').hidden = !trimmed && hiddenCount === 0;

    save({ hidden: state.hidden, ...(trimmed ? { length: state.length } : {}) });
  }

  // Each handle stops short of the other, so they never cross or stack.
  loIn.addEventListener('input', () => {
    state.length = [Math.min(Number(loIn.value), state.length[1] - gap), state.length[1]];
    apply();
  });
  hiIn.addEventListener('input', () => {
    state.length = [state.length[0], Math.max(Number(hiIn.value), state.length[0] + gap)];
    apply();
  });

  root.addEventListener('change', (e) => {
    const box = e.target.closest('[data-hide]');
    if (!box) return;
    const slug = box.closest('tr').dataset.slug;
    state.hidden = box.checked ? [...state.hidden, slug] : state.hidden.filter((s) => s !== slug);
    if (!state.hidden.length) showHidden = false;
    apply();
  });

  el('toggle-hidden').addEventListener('click', () => { showHidden = !showHidden; apply(); });
  el('reset').addEventListener('click', () => {
    state.hidden = [];
    state.length = [min, max];
    showHidden = false;
    apply();
  });

  apply();
}

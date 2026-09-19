// Row sorting for the tables. Each body row carries data-<key> as a number; ties fall back to
// data-alpha (make, then model).
export function sortRows(body, key, dir = 'ascending') {
  const sign = dir === 'ascending' ? 1 : -1;
  const rows = [...body.rows].sort((a, b) =>
    sign * (a.dataset[key] - b.dataset[key]) || a.dataset.alpha - b.dataset.alpha);
  body.append(...rows);
}

// Header-click sorting. Each sortable <th> has data-sort="<key>" and wraps its label in a <button>.
export function sortable(table) {
  const heads = [...table.querySelectorAll('th[data-sort]')];
  for (const th of heads) {
    th.querySelector('button').addEventListener('click', () => {
      const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
      heads.forEach((h) => h.removeAttribute('aria-sort'));
      th.setAttribute('aria-sort', dir);
      sortRows(table.tBodies[0], th.dataset.sort, dir);
    });
  }
}

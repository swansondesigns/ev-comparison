// Site-relative links. One-sheets live at /cars/<slug>/, one per model that passes both gates.
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
export const sheetHref = (slug) => `${base}cars/${slug}/`;

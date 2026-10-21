export const SITE = {
  name: 'Ev1l Pizza',
  handle: 'ev1lpizza',
  description: 'Small, strange, fast-loading web games by ev1lpizza. No installs, no accounts.',
  github: 'https://github.com/ev1lpizza',
  repo: 'https://github.com/ev1lpizza/ev1lpizza.github.io',
  /** Where people can reach you about privacy, accessibility or anything else. */
  contactUrl: 'https://github.com/ev1lpizza/ev1lpizza.github.io/issues',
  contactLabel: 'open an issue on the site’s GitHub repository',
  legalUpdated: new Date('2026-10-21'),
};

/** Prefix a site path with the configured base (works for user and project Pages sites). */
export const url = (path = '') => {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
};

export const fmtDate = (d: Date, opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }) =>
  d.toLocaleDateString('en-US', { timeZone: 'UTC', ...opts });

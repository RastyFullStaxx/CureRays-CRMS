/**
 * Public marketing routes. Imported by `proxy.ts` (middleware) and by the site
 * header and footer, so a new public page is one line in one file.
 *
 * Keep this module free of Node APIs and heavy imports — it is bundled into
 * middleware. Page copy lives in `lib/site-content.ts`.
 */
export type SiteRoute = {
  readonly path: string;
  readonly label: string;
  /**
   * Reachable, but withheld from navigation and the sitemap until its content is
   * complete. A page whose answers are still outstanding should not be offered
   * to visitors or submitted to a search engine.
   */
  readonly draft?: boolean;
};

export const SITE_ROUTES: readonly SiteRoute[] = [
  { path: '/', label: 'Home' },
  { path: '/treatments', label: 'Treatments' },
  { path: '/conditions', label: 'Conditions' },
  { path: '/services', label: 'Services' },
  // Draft until the clinic answers the questions in lib/site-patient-information.ts.
  // Flip this by deleting `draft` once the sections there are filled in.
  { path: '/patient-information', label: 'Patient Information', draft: true },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' }
];

/** Routes shown in the site header and footer — every published route but Home. */
export const SITE_NAV_ROUTES: readonly SiteRoute[] = SITE_ROUTES.filter(
  (route) => route.path !== '/' && !route.draft
);

/** Routes offered to search engines. Drafts are excluded on purpose. */
export const SITE_INDEXABLE_ROUTES: readonly SiteRoute[] = SITE_ROUTES.filter(
  (route) => !route.draft
);

const SITE_PATHS: ReadonlySet<string> = new Set(SITE_ROUTES.map((route) => route.path));

export function isSitePath(pathname: string): boolean {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
  return SITE_PATHS.has(path);
}

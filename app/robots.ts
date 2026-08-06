import type { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.curerays.com').replace(
  /\/$/,
  ''
);

/**
 * The public site is indexable. Everything behind sign-in is not — those routes
 * carry patient data and must never appear in a search index.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/login',
        '/dashboard',
        '/patients',
        '/tasks',
        '/schedule',
        '/analytics',
        '/settings',
        '/templates',
        '/users-roles',
        '/audit-logs',
        '/treatment-delivery'
      ]
    },
    sitemap: `${baseUrl}/sitemap.xml`
  };
}

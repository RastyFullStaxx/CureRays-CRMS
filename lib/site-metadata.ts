import type { Metadata } from 'next';

/**
 * Per-page metadata for the public site.
 *
 * Every page needs its own canonical and its own social card. Inheriting the
 * root's means six routes all claim to be the homepage, which is how duplicate
 * content penalties happen and why a shared link to `/treatments` previewed as
 * the site index.
 *
 * `metadataBase` lives in the root layout, so the paths here stay relative.
 */
export function sitePageMetadata({
  title,
  description,
  path
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  // The template in the root layout appends the brand; social cards get no such
  // treatment, so they are given the full title here.
  const social = `${title} · CureRays`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: 'CureRays Radiation Medicine',
      locale: 'en_US',
      title: social,
      description,
      url: path
    },
    twitter: {
      card: 'summary_large_image',
      title: social,
      description
    }
  };
}

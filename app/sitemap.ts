import type { MetadataRoute } from 'next';
import { SITE_ROUTES } from '@/lib/site-routes';

const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.curerays.com').replace(
  /\/$/,
  ''
);

export default function sitemap(): MetadataRoute.Sitemap {
  return SITE_ROUTES.map((route) => ({
    url: `${baseUrl}${route.path === '/' ? '' : route.path}`,
    changeFrequency: 'monthly',
    priority: route.path === '/' ? 1 : 0.7
  }));
}

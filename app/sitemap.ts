import { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  // Use a relative or placeholder Domain if the actual deployment domain is unknown.
  // Ideally, process.env.NEXT_PUBLIC_SITE_URL should be used in production.
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drilling-rpg.pages.dev';

  return [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/play`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ];
}

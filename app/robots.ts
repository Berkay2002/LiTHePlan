import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://litheplan.tech';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/profile/edit',
        '/login',
        '/signup',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

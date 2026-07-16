import type {
  MetadataRoute,
} from 'next';

export default function robots():
  MetadataRoute.Robots {
  return {
    rules: {
      userAgent:
        '*',

      allow:
        '/',

      disallow: [
        '/admin',
        '/api',
      ],
    },

    sitemap:
      'https://flascam.axplitest.com/sitemap.xml',
  };
}
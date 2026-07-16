import type {
  MetadataRoute,
} from 'next';

import {
  getPublicNews,
} from '@/lib/news-api';

const baseUrl =
  'https://flascam.axplitest.com';

export default async function sitemap():
  Promise<
    MetadataRoute.Sitemap
  > {
  const staticPages:
    MetadataRoute.Sitemap = [
    {
      url:
        `${baseUrl}/`,

      lastModified:
        new Date(),

      changeFrequency:
        'weekly',

      priority:
        1,
    },
    {
      url:
        `${baseUrl}/la-federation`,

      changeFrequency:
        'monthly',

      priority:
        0.8,
    },
    {
      url:
        `${baseUrl}/actualites`,

      changeFrequency:
        'daily',

      priority:
        0.9,
    },
    {
      url:
        `${baseUrl}/associations`,

      changeFrequency:
        'weekly',

      priority:
        0.8,
    },
    {
      url:
        `${baseUrl}/contact`,

      changeFrequency:
        'monthly',

      priority:
        0.6,
    },
  ];

  try {
    const firstPage =
      await getPublicNews({
        page: 1,
        limit: 24,
      });

    const pages = [
      firstPage,
    ];

    for (
      let page = 2;
      page <=
      firstPage.pagination.totalPages;
      page += 1
    ) {
      pages.push(
        await getPublicNews({
          page,
          limit: 24,
        }),
      );
    }

    const newsPages:
      MetadataRoute.Sitemap =
      pages
        .flatMap(
          (result) =>
            result.items,
        )
        .map(
          (article) => ({
            url:
              `${baseUrl}/actualites/${article.slug}`,

            lastModified:
              new Date(
                article.updatedAt,
              ),

            changeFrequency:
              'monthly' as const,

            priority:
              0.7,
          }),
        );

    return [
      ...staticPages,
      ...newsPages,
    ];
  } catch {
    return staticPages;
  }
}
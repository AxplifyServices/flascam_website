import type {
  MetadataRoute,
} from 'next';

import {
  getPublicAssociations,
} from '@/lib/associations-api';

import {
  getPublicNews,
} from '@/lib/news-api';

import {
  getPublicVideos,
} from '@/lib/videos-api';

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(
    /\/+$/,
    '',
  ) ||
  'https://flascam.axplitest.com';

export default async function sitemap():
  Promise<MetadataRoute.Sitemap> {
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
        `${baseUrl}/videotheque`,

      changeFrequency:
        'weekly',

      priority:
        0.8,
    },
    {
      url:
        `${baseUrl}/marketplace`,

      changeFrequency:
        'monthly',

      priority:
        0.6,
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

  const [
    newsPages,
    associationPages,
    videoPages,
  ] =
    await Promise.all([
      loadNewsSitemap(),
      loadAssociationSitemap(),
      loadVideoSitemap(),
    ]);

  return [
    ...staticPages,
    ...newsPages,
    ...associationPages,
    ...videoPages,
  ];
}

async function loadNewsSitemap():
  Promise<MetadataRoute.Sitemap> {
  try {
    const firstPage =
      await getPublicNews({
        page: 1,
        limit: 24,
      });

    const results = [
      ...firstPage.items,
    ];

    for (
      let page = 2;
      page <=
      firstPage.pagination.totalPages;
      page += 1
    ) {
      const response =
        await getPublicNews({
          page,
          limit: 24,
        });

      results.push(
        ...response.items,
      );
    }

    return results.map(
      (
        article,
      ) => ({
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
  } catch {
    return [];
  }
}

async function loadAssociationSitemap():
  Promise<MetadataRoute.Sitemap> {
  try {
    const associations =
      await getPublicAssociations();

    return associations.map(
      (
        association,
      ) => ({
        url:
          `${baseUrl}/associations/${association.slug}`,

        changeFrequency:
          'monthly' as const,

        priority:
          0.7,
      }),
    );
  } catch {
    return [];
  }
}

async function loadVideoSitemap():
  Promise<MetadataRoute.Sitemap> {
  try {
    const firstPage =
      await getPublicVideos({
        page: 1,
        limit: 24,
      });

    const results = [
      ...firstPage.items,
    ];

    for (
      let page = 2;
      page <=
      firstPage.pagination.totalPages;
      page += 1
    ) {
      const response =
        await getPublicVideos({
          page,
          limit: 24,
        });

      results.push(
        ...response.items,
      );
    }

    return results.map(
      (
        video,
      ) => ({
        url:
          `${baseUrl}/videotheque/${video.slug}`,

        lastModified:
          new Date(
            video.updatedAt,
          ),

        changeFrequency:
          'monthly' as const,

        priority:
          0.7,
      }),
    );
  } catch {
    return [];
  }
}
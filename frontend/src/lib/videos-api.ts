import {
  API_URL,
} from '@/lib/api';

import type {
  PublicVideoFilters,
  VideoItem,
  VideoListResponse,
} from '@/types/videos';

const EMPTY_RESPONSE: VideoListResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  },
};

async function publicFetch<T>(
  path: string,
  revalidate = 60,
): Promise<T | null> {
  try {
    const response =
      await fetch(
        `${API_URL}${path}`,
        {
          next: {
            revalidate,
          },

          signal:
            AbortSignal.timeout(
              8_000,
            ),
        },
      );

    if (!response.ok) {
      return null;
    }

    return (
      await response.json()
    ) as T;
  } catch {
    return null;
  }
}

function buildPublicVideoParams(
  filters: PublicVideoFilters,
) {
  const params =
    new URLSearchParams();

  params.set(
    'page',
    String(
      filters.page ?? 1,
    ),
  );

  params.set(
    'limit',
    String(
      filters.limit ?? 12,
    ),
  );

  if (
    filters.search?.trim()
  ) {
    params.set(
      'search',
      filters.search.trim(),
    );
  }

  if (
    filters.provider
  ) {
    params.set(
      'provider',
      filters.provider,
    );
  }

  if (
    filters.associationSlug?.trim()
  ) {
    params.set(
      'associationSlug',
      filters.associationSlug.trim(),
    );
  }

  return params;
}

export async function getPublicVideos(
  filters: PublicVideoFilters = {},
) {
  const params =
    buildPublicVideoParams(
      filters,
    );

  return (
    await publicFetch<VideoListResponse>(
      `/videos/public?${params.toString()}`,
    )
  ) ?? {
    ...EMPTY_RESPONSE,

    pagination: {
      ...EMPTY_RESPONSE.pagination,

      page:
        filters.page ??
        1,

      limit:
        filters.limit ??
        12,
    },
  };
}

export async function getFeaturedVideos() {
  return (
    await publicFetch<VideoItem[]>(
      '/videos/public/featured',
    )
  ) ?? [];
}

export async function getPublicVideoBySlug(
  slug: string,
) {
  return await publicFetch<VideoItem>(
    `/videos/public/${encodeURIComponent(slug)}`,
  );
}

export async function getPublicAssociationVideos(
  associationSlug: string,
  filters: Omit<
    PublicVideoFilters,
    'associationSlug'
  > = {},
) {
  const params =
    buildPublicVideoParams(
      filters,
    );

  return (
    await publicFetch<VideoListResponse>(
      `/videos/public/association/${encodeURIComponent(
        associationSlug,
      )}?${params.toString()}`,
    )
  ) ?? {
    ...EMPTY_RESPONSE,

    pagination: {
      ...EMPTY_RESPONSE.pagination,

      page:
        filters.page ??
        1,

      limit:
        filters.limit ??
        12,
    },
  };
}
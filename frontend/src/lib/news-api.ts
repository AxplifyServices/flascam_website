import {
  apiFetch,
} from '@/lib/api';

import type {
  NewsAdminFilters,
  NewsArticle,
  NewsContentType,
  NewsFormState,
  NewsListResponse,
  NewsStatus,
  UploadedNewsMedia,
} from '@/types/news';

async function readErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const data =
      await response.json() as {
        message?: string | string[];
      };

    if (
      Array.isArray(
        data.message,
      )
    ) {
      return data.message.join(
        ' ',
      );
    }

    return (
      data.message ??
      fallback
    );
  } catch {
    return fallback;
  }
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response =
    await apiFetch(
      path,
      {
        cache: 'no-store',
        ...init,
      },
    );

  if (
    response.status === 401
  ) {
    await apiFetch(
      '/auth/refresh',
      {
        method: 'POST',
      },
    );

    response =
      await apiFetch(
        path,
        {
          cache: 'no-store',
          ...init,
        },
      );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Action impossible.',
      ),
    );
  }

  return await response.json() as T;
}

function optionalText(
  value: string,
) {
  const trimmed =
    value.trim();

  return trimmed
    ? trimmed
    : undefined;
}

function localDateTimeToIso(
  value: string,
) {
  if (!value) {
    return undefined;
  }

  const parsed =
    new Date(value);

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return undefined;
  }

  return parsed.toISOString();
}

function buildPayload(
  form: NewsFormState,
) {
  const isEvent =
    form.contentType ===
    'EVENT';

  return {
    contentType:
      form.contentType,

    eventCategory:
      isEvent
        ? (
            form.eventCategory ||
            undefined
          )
        : undefined,

    title:
      form.title.trim(),

    slug:
      form.slug.trim(),

    excerpt:
      optionalText(
        form.excerpt,
      ),

    body:
      optionalText(
        form.body,
      ),

    eventStartAt:
      isEvent
        ? localDateTimeToIso(
            form.eventStartAt,
          )
        : undefined,

    eventEndAt:
      isEvent
        ? localDateTimeToIso(
            form.eventEndAt,
          )
        : undefined,

    eventLocation:
      isEvent
        ? optionalText(
            form.eventLocation,
          )
        : undefined,

    seoTitle:
      optionalText(
        form.seoTitle,
      ),

    seoDescription:
      optionalText(
        form.seoDescription,
      ),

    media:
      form.media.map(
        (
          item,
          index,
        ) => ({
          mediaAssetId:
            item.mediaAssetId,

          displayOrder:
            index,

          altText:
            optionalText(
              item.altText,
            ),

          caption:
            optionalText(
              item.caption,
            ),
        }),
      ),
  };
}

export async function getAdminNews(
  filters: NewsAdminFilters,
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
      filters.limit ?? 20,
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
    filters.contentType
  ) {
    params.set(
      'contentType',
      filters.contentType,
    );
  }

  if (
    filters.status
  ) {
    params.set(
      'status',
      filters.status,
    );
  }

  return await adminFetch<NewsListResponse>(
    `/news/admin?${params.toString()}`,
  );
}

export async function getAdminNewsById(
  id: string,
) {
  return await adminFetch<NewsArticle>(
    `/news/admin/${id}`,
  );
}

export async function createNews(
  form: NewsFormState,
) {
  return await adminFetch<NewsArticle>(
    '/news/admin',
    {
      method: 'POST',

      body: JSON.stringify(
        buildPayload(form),
      ),
    },
  );
}

export async function updateNews(
  id: string,
  form: NewsFormState,
) {
  return await adminFetch<NewsArticle>(
    `/news/admin/${id}`,
    {
      method: 'PUT',

      body: JSON.stringify(
        buildPayload(form),
      ),
    },
  );
}

export async function updateNewsStatus(
  id: string,
  status: NewsStatus,
) {
  return await adminFetch<NewsArticle>(
    `/news/admin/${id}/status`,
    {
      method: 'PATCH',

      body: JSON.stringify({
        status,
      }),
    },
  );
}

export async function scheduleNewsPublication(
  id: string,
  scheduledAt: string,
) {
  const parsedDate =
    new Date(
      scheduledAt,
    );

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    throw new Error(
      'La date de publication programmée est invalide.',
    );
  }

  return await adminFetch<NewsArticle>(
    `/news/admin/${id}/schedule`,
    {
      method: 'PATCH',

      body:
        JSON.stringify({
          scheduledAt:
            parsedDate.toISOString(),
        }),
    },
  );
}

export async function cancelNewsPublicationSchedule(
  id: string,
) {
  return await adminFetch<NewsArticle>(
    `/news/admin/${id}/schedule`,
    {
      method: 'DELETE',
    },
  );
}

export async function deleteNews(
  id: string,
) {
  return await adminFetch<{
    success: boolean;
  }>(
    `/news/admin/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function uploadNewsMedia(
  file: File,
) {
  const formData =
    new FormData();

  formData.append(
    'file',
    file,
  );

  return await adminFetch<UploadedNewsMedia>(
    '/media/admin/news-media',
    {
      method: 'POST',
      body: formData,
    },
  );
}

export type PublicNewsFilters = {
  page?: number;
  limit?: number;
  search?: string;
  contentType?: NewsContentType | '';
  eventCategory?: string;
  eventPeriod?:
    | 'UPCOMING'
    | 'ONGOING'
    | 'PAST'
    | '';
};

async function publicNewsFetch<T>(
  path: string,
): Promise<T> {
  let response:
    Response;

  try {
    response =
      await apiFetch(
        path,
        {
          cache:
            'no-store',

          next: {
            revalidate:
              0,
          },
        },
      );
  } catch (
    caughtError
  ) {
    const details =
      caughtError instanceof
        Error
        ? caughtError.message
        : 'Erreur réseau inconnue.';

    throw new Error(
      `API des actualités inaccessible : ${details}`,
    );
  }

  if (!response.ok) {
    const message =
      await readErrorMessage(
        response,
        'Impossible de charger les actualités.',
      );

    throw new Error(
      `${message} HTTP ${response.status}.`,
    );
  }

  return await response.json() as T;
}

export async function getPublicNews(
  filters: PublicNewsFilters = {},
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
    filters.contentType
  ) {
    params.set(
      'contentType',
      filters.contentType,
    );
  }

  if (
    filters.eventCategory
  ) {
    params.set(
      'eventCategory',
      filters.eventCategory,
    );
  }

  if (
    filters.eventPeriod
  ) {
    params.set(
      'eventPeriod',
      filters.eventPeriod,
    );
  }

  return await publicNewsFetch<NewsListResponse>(
    `/news/public?${params.toString()}`,
  );
}

export async function getLatestPublicNews() {
  return await publicNewsFetch<
    NewsArticle[]
  >(
    '/news/public/latest',
  );
}

export async function getPublicNewsBySlug(
  slug: string,
) {
  return await publicNewsFetch<NewsArticle>(
    `/news/public/${encodeURIComponent(
      slug,
    )}`,
  );
}
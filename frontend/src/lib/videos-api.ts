import {
  apiFetch,
  API_URL,
} from '@/lib/api';

import type {
  PublicVideoFilters,
  UploadedVideoMedia,
  UploadedVideoThumbnail,
  VideoAdminFilters,
  VideoAssociationFilters,
  VideoFormState,
  VideoItem,
  VideoListResponse,
  VideoStatus,
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
    response.status ===
    401
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

if (
  response.status ===
    204
) {
  return undefined as T;
}

const contentType =
  response.headers.get(
    'content-type',
  );

if (
  !contentType?.includes(
    'application/json',
  )
) {
  return undefined as T;
}

return await response.json() as T;
}

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

function optionalText(
  value: string,
) {
  const normalized =
    value.trim();

  return normalized
    ? normalized
    : undefined;
}

function localDateTimeToIso(
  value: string,
) {
  const normalized =
    value.trim();

  if (!normalized) {
    return undefined;
  }

  const parsed =
    new Date(
      normalized,
    );

  if (
    Number.isNaN(
      parsed.getTime(),
    )
  ) {
    return undefined;
  }

  return parsed.toISOString();
}

function buildVideoPayload(
  form: VideoFormState,
  mode:
    | 'ADMIN'
    | 'ASSOCIATION',
) {
  return {
    title:
      form.title.trim(),

    slug:
      form.slug.trim(),

    excerpt:
      optionalText(
        form.excerpt,
      ),

    description:
      optionalText(
        form.description,
      ),

    provider:
      form.provider,

    externalUrl:
      form.provider ===
      'YOUTUBE'
        ? optionalText(
            form.externalUrl,
          )
        : undefined,

    mediaAssetId:
      form.provider ===
      'UPLOADED'
        ? optionalText(
            form.mediaAssetId,
          )
        : undefined,

    thumbnailMediaAssetId:
      optionalText(
        form.thumbnailMediaAssetId,
      ),

    regionalAssociationId:
      mode ===
        'ADMIN'
        ? optionalText(
            form.regionalAssociationId,
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

    displayOrder:
      Number.isFinite(
        Number(
          form.displayOrder,
        ),
      )
        ? Number(
            form.displayOrder,
          )
        : 0,

    isFeatured:
      mode ===
        'ADMIN'
        ? form.isFeatured
        : false,

    scheduledAt:
      mode ===
        'ADMIN'
        ? localDateTimeToIso(
            form.scheduledAt,
          )
        : undefined,
  };
}

function appendListFilters(
  params: URLSearchParams,
  filters:
    | VideoAdminFilters
    | VideoAssociationFilters,
) {
  params.set(
    'page',
    String(
      filters.page ??
      1,
    ),
  );

  params.set(
    'limit',
    String(
      filters.limit ??
      20,
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
    filters.status
  ) {
    params.set(
      'status',
      filters.status,
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
}

function buildPublicVideoParams(
  filters: PublicVideoFilters,
) {
  const params =
    new URLSearchParams();

  params.set(
    'page',
    String(
      filters.page ??
      1,
    ),
  );

  params.set(
    'limit',
    String(
      filters.limit ??
      12,
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

/*
 * Routes publiques
 */

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
    `/videos/public/${encodeURIComponent(
      slug,
    )}`,
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

/*
 * Administration FLASCAM
 */

export async function getAdminVideos(
  filters: VideoAdminFilters = {},
) {
  const params =
    new URLSearchParams();

  appendListFilters(
    params,
    filters,
  );

  if (
    filters.sourceType
  ) {
    params.set(
      'sourceType',
      filters.sourceType,
    );
  }

  if (
    filters.regionalAssociationId
  ) {
    params.set(
      'regionalAssociationId',
      filters.regionalAssociationId,
    );
  }

  return await adminFetch<VideoListResponse>(
    `/videos/admin?${params.toString()}`,
  );
}

export async function getAdminVideoById(
  id: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}`,
  );
}

export async function createAdminVideo(
  form: VideoFormState,
) {
  return await adminFetch<VideoItem>(
    '/videos/admin',
    {
      method:
        'POST',

      body:
        JSON.stringify(
          buildVideoPayload(
            form,
            'ADMIN',
          ),
        ),
    },
  );
}

export async function updateAdminVideo(
  id: string,
  form: VideoFormState,
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}`,
    {
      method:
        'PUT',

      body:
        JSON.stringify(
          buildVideoPayload(
            form,
            'ADMIN',
          ),
        ),
    },
  );
}

export async function updateAdminVideoStatus(
  id: string,
  status:
    | 'DRAFT'
    | 'PUBLISHED'
    | 'ARCHIVED',
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}/status`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          status,
        }),
    },
  );
}

export async function approveAssociationVideo(
  id: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}/approve`,
    {
      method:
        'PATCH',
    },
  );
}

export async function rejectAssociationVideo(
  id: string,
  reason: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}/reject`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          reason:
            reason.trim(),
        }),
    },
  );
}

export async function scheduleAdminVideo(
  id: string,
  scheduledAt: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}/schedule`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          scheduledAt:
            localDateTimeToIso(
              scheduledAt,
            ),
        }),
    },
  );
}

export async function cancelAdminVideoSchedule(
  id: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}/schedule`,
    {
      method:
        'DELETE',
    },
  );
}

export async function deleteAdminVideo(
  id: string,
) {
  return await adminFetch<{
    success: boolean;
  }>(
    `/videos/admin/${encodeURIComponent(
      id,
    )}`,
    {
      method:
        'DELETE',
    },
  );
}

/*
 * Espace association
 */

export async function getAssociationVideos(
  filters: VideoAssociationFilters = {},
) {
  const params =
    new URLSearchParams();

  appendListFilters(
    params,
    filters,
  );

  return await adminFetch<VideoListResponse>(
    `/videos/association?${params.toString()}`,
  );
}

export async function getAssociationVideoById(
  id: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/association/${encodeURIComponent(
      id,
    )}`,
  );
}

export async function createAssociationVideo(
  form: VideoFormState,
) {
  return await adminFetch<VideoItem>(
    '/videos/association',
    {
      method:
        'POST',

      body:
        JSON.stringify(
          buildVideoPayload(
            form,
            'ASSOCIATION',
          ),
        ),
    },
  );
}

export async function updateAssociationVideo(
  id: string,
  form: VideoFormState,
) {
  return await adminFetch<VideoItem>(
    `/videos/association/${encodeURIComponent(
      id,
    )}`,
    {
      method:
        'PUT',

      body:
        JSON.stringify(
          buildVideoPayload(
            form,
            'ASSOCIATION',
          ),
        ),
    },
  );
}

export async function submitAssociationVideo(
  id: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/association/${encodeURIComponent(
      id,
    )}/submit`,
    {
      method:
        'PATCH',
    },
  );
}

export async function unpublishAssociationVideo(
  id: string,
) {
  return await adminFetch<VideoItem>(
    `/videos/association/${encodeURIComponent(
      id,
    )}/unpublish`,
    {
      method:
        'PATCH',
    },
  );
}

export async function deleteAssociationVideo(
  id: string,
) {
  return await adminFetch<{
    success: boolean;
  }>(
    `/videos/association/${encodeURIComponent(
      id,
    )}`,
    {
      method:
        'DELETE',
    },
  );
}

/*
 * Imports
 */

async function uploadMedia<T>(
  path: string,
  file: File,
) {
  const formData =
    new FormData();

  formData.append(
    'file',
    file,
  );

  return await adminFetch<T>(
    path,
    {
      method:
        'POST',

      body:
        formData,
    },
  );
}

export async function uploadAdminVideo(
  file: File,
) {
  return await uploadMedia<UploadedVideoMedia>(
    '/media/admin/videos',
    file,
  );
}

export async function uploadAdminVideoThumbnail(
  file: File,
) {
  return await uploadMedia<UploadedVideoThumbnail>(
    '/media/admin/video-thumbnails',
    file,
  );
}

export async function uploadAssociationVideo(
  file: File,
) {
  return await uploadMedia<UploadedVideoMedia>(
    '/media/association/videos',
    file,
  );
}

export async function uploadAssociationVideoThumbnail(
  file: File,
) {
  return await uploadMedia<UploadedVideoThumbnail>(
    '/media/association/video-thumbnails',
    file,
  );
}

export const VIDEO_STATUS_LABELS:
  Record<
    VideoStatus,
    string
  > = {
  DRAFT:
    'Brouillon',

  PENDING_REVIEW:
    'En attente de validation',

  REJECTED:
    'Rejetée',

  PUBLISHED:
    'Publiée',

  ARCHIVED:
    'Archivée',
};
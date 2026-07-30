import {
  apiFetch,
} from '@/lib/api';

import type {
  MarketplaceListing,
  MarketplaceListingListResponse,
  MarketplaceListingPayload,
  MyMarketplaceListingFilters,
  UploadedMarketplaceMedia,
} from '@/types/marketplace';

async function readErrorMessage(
  response: Response,
  fallback: string,
) {
  try {
    const body =
      await response.json() as {
        message?:
          | string
          | string[];
      };

    if (
      Array.isArray(
        body.message,
      )
    ) {
      return body.message.join(
        ' ',
      );
    }

    return (
      body.message ||
      fallback
    );
  } catch {
    return fallback;
  }
}

async function authenticatedMarketplaceFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response =
    await apiFetch(
      path,
      {
        cache:
          'no-store',

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
        method:
          'POST',
      },
    );

    response =
      await apiFetch(
        path,
        {
          cache:
            'no-store',

          ...init,
        },
      );
  }

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'L’action marketplace n’a pas pu être réalisée.',
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

function addOptionalText(
  params: URLSearchParams,
  name: string,
  value?: string,
) {
  const normalized =
    value?.trim();

  if (normalized) {
    params.set(
      name,
      normalized,
    );
  }
}

export async function getMyMarketplaceListings(
  filters:
    MyMarketplaceListingFilters = {},
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
      20,
    ),
  );

  addOptionalText(
    params,
    'search',
    filters.search,
  );

  if (
    filters.status
  ) {
    params.set(
      'status',
      filters.status,
    );
  }

  return await authenticatedMarketplaceFetch<
    MarketplaceListingListResponse
  >(
    `/marketplace/my-listings?${params.toString()}`,
  );
}

export async function getMyMarketplaceListingById(
  id: string,
) {
  return await authenticatedMarketplaceFetch<
    MarketplaceListing
  >(
    `/marketplace/my-listings/${encodeURIComponent(
      id,
    )}`,
  );
}

export async function createMarketplaceListing(
  payload:
    MarketplaceListingPayload,
) {
  return await authenticatedMarketplaceFetch<
    MarketplaceListing
  >(
    '/marketplace/my-listings',
    {
      method:
        'POST',

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

export async function updateMarketplaceListing(
  id: string,
  payload:
    MarketplaceListingPayload,
) {
  return await authenticatedMarketplaceFetch<
    MarketplaceListing
  >(
    `/marketplace/my-listings/${encodeURIComponent(
      id,
    )}`,
    {
      method:
        'PUT',

      body:
        JSON.stringify(
          payload,
        ),
    },
  );
}

export async function submitMarketplaceListing(
  id: string,
) {
  return await authenticatedMarketplaceFetch<
    MarketplaceListing
  >(
    `/marketplace/my-listings/${encodeURIComponent(
      id,
    )}/submit`,
    {
      method:
        'PATCH',
    },
  );
}

export async function withdrawMarketplaceListing(
  id: string,
) {
  return await authenticatedMarketplaceFetch<
    MarketplaceListing
  >(
    `/marketplace/my-listings/${encodeURIComponent(
      id,
    )}/withdraw`,
    {
      method:
        'PATCH',
    },
  );
}

async function uploadMarketplaceMedia(
  path: string,
  file: File,
) {
  const formData =
    new FormData();

  formData.append(
    'file',
    file,
  );

  return await authenticatedMarketplaceFetch<
    UploadedMarketplaceMedia
  >(
    path,
    {
      method:
        'POST',

      body:
        formData,
    },
  );
}

export async function uploadMarketplaceImage(
  file: File,
) {
  return await uploadMarketplaceMedia(
    '/media/marketplace/images',
    file,
  );
}

export async function uploadMarketplaceVideo(
  file: File,
) {
  return await uploadMarketplaceMedia(
    '/media/marketplace/videos',
    file,
  );
}
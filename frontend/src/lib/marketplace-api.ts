import {
  apiFetch,
} from '@/lib/api';

import type {
  AdminMarketplaceListing,
  AdminMarketplaceListingFilters,
  AdminMarketplaceListingListResponse,
  MarketplaceListing,
  MarketplaceListingListResponse,
  MarketplaceListingPayload,
  MyMarketplaceListingFilters,
  UploadedMarketplaceMedia,
  PublicMarketplaceListingDetail,
PublicMarketplaceListingFilters,
PublicMarketplaceListingListResponse,
CreateMarketplaceOfferPayload,
MarketplaceOfferFilters,
ReceivedMarketplaceOffer,
SentMarketplaceOffer,
MarketplaceOfferListResponse,
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

async function publicMarketplaceFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response =
    await apiFetch(
      path,
      {
        cache:
          'no-store',

        ...init,
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible de charger la marketplace.',
      ),
    );
  }

  return await response.json() as T;
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

function addOptionalNumber(
  params: URLSearchParams,
  name: string,
  value?: number,
) {
  if (
    value !== undefined &&
    Number.isFinite(
      value,
    )
  ) {
    params.set(
      name,
      String(
        value,
      ),
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

export async function getAdminMarketplaceListings(
  filters:
    AdminMarketplaceListingFilters = {},
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

  if (
    filters.sellerType
  ) {
    params.set(
      'sellerType',
      filters.sellerType,
    );
  }

  return await authenticatedMarketplaceFetch<
    AdminMarketplaceListingListResponse
  >(
    `/marketplace/admin/listings?${params.toString()}`,
  );
}

export async function getAdminMarketplaceListingById(
  id: string,
) {
  return await authenticatedMarketplaceFetch<
    AdminMarketplaceListing
  >(
    `/marketplace/admin/listings/${encodeURIComponent(
      id,
    )}`,
  );
}

export async function approveMarketplaceListing(
  id: string,
) {
  return await authenticatedMarketplaceFetch<
    AdminMarketplaceListing
  >(
    `/marketplace/admin/listings/${encodeURIComponent(
      id,
    )}/approve`,
    {
      method:
        'PATCH',
    },
  );
}

export async function rejectMarketplaceListing(
  id: string,
  reason: string,
) {
  return await authenticatedMarketplaceFetch<
    AdminMarketplaceListing
  >(
    `/marketplace/admin/listings/${encodeURIComponent(
      id,
    )}/reject`,
    {
      method:
        'PATCH',

      body:
        JSON.stringify({
          reason,
        }),
    },
  );
}

export async function getPublicMarketplaceListings(
  filters:
    PublicMarketplaceListingFilters = {},
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

  params.set(
    'sort',
    filters.sort ??
      'RECENT',
  );

  addOptionalText(
    params,
    'search',
    filters.search,
  );

  if (
    filters.vehicleType
  ) {
    params.set(
      'vehicleType',
      filters.vehicleType,
    );
  }

  addOptionalText(
    params,
    'brand',
    filters.brand,
  );

  addOptionalText(
    params,
    'model',
    filters.model,
  );

  if (
    filters.fuelType
  ) {
    params.set(
      'fuelType',
      filters.fuelType,
    );
  }

  if (
    filters.transmission
  ) {
    params.set(
      'transmission',
      filters.transmission,
    );
  }

  addOptionalNumber(
    params,
    'minimumYear',
    filters.minimumYear,
  );

  addOptionalNumber(
    params,
    'maximumYear',
    filters.maximumYear,
  );

  addOptionalNumber(
    params,
    'minimumPrice',
    filters.minimumPrice,
  );

  addOptionalNumber(
    params,
    'maximumPrice',
    filters.maximumPrice,
  );

  addOptionalNumber(
    params,
    'maximumMileageKm',
    filters.maximumMileageKm,
  );

  return await publicMarketplaceFetch<
    PublicMarketplaceListingListResponse
  >(
    `/marketplace/public?${params.toString()}`,
  );
}

export async function getPublicMarketplaceListingBySlug(
  slug: string,
) {
  return await publicMarketplaceFetch<
    PublicMarketplaceListingDetail
  >(
    `/marketplace/public/${encodeURIComponent(
      slug,
    )}`,
  );
}

export async function createMarketplaceOffer(
  listingId: string,
  payload:
    CreateMarketplaceOfferPayload,
) {
  return await authenticatedMarketplaceFetch<
    SentMarketplaceOffer
  >(
    `/marketplace/listings/${encodeURIComponent(
      listingId,
    )}/offers`,
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

export async function getSentMarketplaceOffers(
  filters:
    MarketplaceOfferFilters = {},
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

  if (
    filters.status
  ) {
    params.set(
      'status',
      filters.status,
    );
  }

  return await authenticatedMarketplaceFetch<
    MarketplaceOfferListResponse<
      SentMarketplaceOffer
    >
  >(
    `/marketplace/my-offers/sent?${params.toString()}`,
  );
}

export async function getReceivedMarketplaceOffers(
  filters:
    MarketplaceOfferFilters = {},
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

  if (
    filters.status
  ) {
    params.set(
      'status',
      filters.status,
    );
  }

  return await authenticatedMarketplaceFetch<
    MarketplaceOfferListResponse<
      ReceivedMarketplaceOffer
    >
  >(
    `/marketplace/my-offers/received?${params.toString()}`,
  );
}

export async function cancelMarketplaceOffer(
  offerId: string,
) {
  return await authenticatedMarketplaceFetch<
    SentMarketplaceOffer
  >(
    `/marketplace/my-offers/${encodeURIComponent(
      offerId,
    )}/cancel`,
    {
      method:
        'PATCH',
    },
  );
}

export async function rejectMarketplaceOffer(
  offerId: string,
) {
  return await authenticatedMarketplaceFetch<
    ReceivedMarketplaceOffer
  >(
    `/marketplace/my-offers/${encodeURIComponent(
      offerId,
    )}/reject`,
    {
      method:
        'PATCH',
    },
  );
}

export async function acceptMarketplaceOffer(
  offerId: string,
) {
  return await authenticatedMarketplaceFetch<
    ReceivedMarketplaceOffer
  >(
    `/marketplace/my-offers/${encodeURIComponent(
      offerId,
    )}/accept`,
    {
      method:
        'PATCH',
    },
  );
}
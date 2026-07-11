import {
  apiFetch,
  API_URL,
} from '@/lib/api';

import type {
  AssociationDetail,
  AssociationFormState,
  AssociationMediaFormState,
  AssociationPostFormState,
  AssociationSummary,
} from '@/types/associations';

async function publicFetch<T>(
  path: string,
): Promise<T | null> {
  try {
    const response = await fetch(
      `${API_URL}${path}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    return await response.json() as T;
  } catch {
    return null;
  }
}

async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  let response = await apiFetch(
    path,
    {
      cache: 'no-store',
      ...init,
    },
  );

  if (response.status === 401) {
    await apiFetch(
      '/auth/refresh',
      {
        method: 'POST',
      },
    );

    response = await apiFetch(
      path,
      {
        cache: 'no-store',
        ...init,
      },
    );
  }

  if (!response.ok) {
    const body =
      await response
        .json()
        .catch(() => null);

    throw new Error(
      Array.isArray(body?.message)
        ? body.message.join(' ')
        : body?.message ??
            'Action impossible.',
    );
  }

  return await response.json() as T;
}

function emptyToUndefined(
  value: string,
) {
  const trimmed = value.trim();

  return trimmed === ''
    ? undefined
    : trimmed;
}

function numberOrUndefined(
  value: string,
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed)
    ? parsed
    : undefined;
}

export async function getPublicAssociations() {
  return (
    await publicFetch<AssociationSummary[]>(
      '/associations/public',
    )
  ) ?? [];
}

export async function getFeaturedAssociations() {
  return (
    await publicFetch<AssociationSummary[]>(
      '/associations/public/featured',
    )
  ) ?? [];
}

export async function getPublicAssociationBySlug(
  slug: string,
) {
  return await publicFetch<AssociationDetail>(
    `/associations/public/${slug}`,
  );
}

export async function getAdminAssociations() {
  return await adminFetch<AssociationSummary[]>(
    '/associations/admin',
  );
}

export async function uploadAdminImage(
  file: File,
) {
  const formData =
    new FormData();

  formData.append(
    'file',
    file,
  );

  return await adminFetch<{
    id: string;
    url: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
  }>(
    '/media/admin/images',
    {
      method: 'POST',
      body: formData,
    },
  );
}

export async function getAdminAssociation(
  id: string,
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${id}`,
  );
}

export async function createAdminAssociation(
  form: AssociationFormState,
) {
  return await adminFetch<AssociationDetail>(
    '/associations/admin',
    {
      method: 'POST',
      body: JSON.stringify(
        associationPayload(form),
      ),
    },
  );
}

export async function updateAdminAssociation(
  id: string,
  form: AssociationFormState,
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(
        associationPayload(form),
      ),
    },
  );
}

export async function updateAdminAssociationStatus(
  id: string,
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'PUBLISHED'
    | 'ARCHIVED',
) {
  return await adminFetch<{
    id: string;
    status: string;
    publishedAt?: string | null;
  }>(
    `/associations/admin/${id}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      }),
    },
  );
}

export async function createAssociationPost(
  associationId: string,
  form: AssociationPostFormState,
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${associationId}/posts`,
    {
      method: 'POST',
      body: JSON.stringify(
        associationPostPayload(form),
      ),
    },
  );
}

export async function updateAssociationPost(
  associationId: string,
  postId: string,
  form: AssociationPostFormState,
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${associationId}/posts/${postId}`,
    {
      method: 'PUT',
      body: JSON.stringify(
        associationPostPayload(form),
      ),
    },
  );
}

export async function updateAssociationPostStatus(
  associationId: string,
  postId: string,
  status:
    | 'DRAFT'
    | 'SUBMITTED'
    | 'PUBLISHED'
    | 'ARCHIVED',
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${associationId}/posts/${postId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        status,
      }),
    },
  );
}

export async function createAssociationMediaItem(
  associationId: string,
  form: AssociationMediaFormState,
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${associationId}/media`,
    {
      method: 'POST',
      body: JSON.stringify(
        associationMediaPayload(form),
      ),
    },
  );
}

export async function updateAssociationMediaItem(
  associationId: string,
  mediaItemId: string,
  form: AssociationMediaFormState,
) {
  return await adminFetch<AssociationDetail>(
    `/associations/admin/${associationId}/media/${mediaItemId}`,
    {
      method: 'PUT',
      body: JSON.stringify(
        associationMediaPayload(form),
      ),
    },
  );
}

function associationPayload(
  form: AssociationFormState,
) {
  return {
    name: form.name.trim(),
    slug: form.slug.trim(),
    acronym:
      emptyToUndefined(form.acronym),
    region: form.region.trim(),
    city: emptyToUndefined(form.city),
    memberCount:
      numberOrUndefined(
        form.memberCount,
      ),
    affiliatedSinceYear:
      numberOrUndefined(
        form.affiliatedSinceYear,
      ),
logoMediaAssetId:
  emptyToUndefined(
    form.logoMediaAssetId,
  ),
coverImageUrl:
  emptyToUndefined(
    form.coverImageUrl,
  ),
logoText:
      emptyToUndefined(form.logoText),
    presentation:
      emptyToUndefined(
        form.presentation,
      ),
    address:
      emptyToUndefined(form.address),
    phone:
      emptyToUndefined(form.phone),
    email:
      emptyToUndefined(form.email),
    websiteUrl:
      emptyToUndefined(
        form.websiteUrl,
      ),
    facebookUrl:
      emptyToUndefined(
        form.facebookUrl,
      ),
    instagramUrl:
      emptyToUndefined(
        form.instagramUrl,
      ),
    linkedinUrl:
      emptyToUndefined(
        form.linkedinUrl,
      ),
    youtubeUrl:
      emptyToUndefined(
        form.youtubeUrl,
      ),
    isFeatured: form.isFeatured,
    displayOrder:
      numberOrUndefined(
        form.displayOrder,
      ) ?? 0,
    seoTitle:
      emptyToUndefined(
        form.seoTitle,
      ),
    seoDescription:
      emptyToUndefined(
        form.seoDescription,
      ),

adminEmail:
  emptyToUndefined(
    form.adminEmail,
  ),
adminFirstName:
  emptyToUndefined(
    form.adminFirstName,
  ),
adminLastName:
  emptyToUndefined(
    form.adminLastName,
  ),
adminPassword:
  emptyToUndefined(
    form.adminPassword,
  ),      
  };
}

function associationPostPayload(
  form: AssociationPostFormState,
) {
  return {
    contentType: form.contentType,
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt:
      emptyToUndefined(form.excerpt),
    body:
      emptyToUndefined(form.body),
    coverMediaAssetId:
      emptyToUndefined(
        form.coverMediaAssetId,
      ),
    eventStartAt:
      emptyToUndefined(
        form.eventStartAt,
      ),
    eventEndAt:
      emptyToUndefined(
        form.eventEndAt,
      ),
    eventLocation:
      emptyToUndefined(
        form.eventLocation,
      ),
    displayOrder:
      numberOrUndefined(
        form.displayOrder,
      ) ?? 0,
    seoTitle:
      emptyToUndefined(
        form.seoTitle,
      ),
    seoDescription:
      emptyToUndefined(
        form.seoDescription,
      ),
  };
}

function associationMediaPayload(
  form: AssociationMediaFormState,
) {
  return {
    mediaType: form.mediaType,
    mediaAssetId:
      form.mediaAssetId.trim(),
    title:
      emptyToUndefined(form.title),
    caption:
      emptyToUndefined(form.caption),
    displayOrder:
      numberOrUndefined(
        form.displayOrder,
      ) ?? 0,
    isPublished:
      form.isPublished,
  };
}
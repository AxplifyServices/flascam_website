import {
  API_URL,
  apiFetch,
} from '@/lib/api';

import type {
  HomepageHeroSlide,
} from '@/types/homepage-hero';

export type CreateHomepageHeroSlidePayload = {
  mediaAssetId: string;
  title?: string;
  altText: string;
  displayOrder?: number;
  isPublished?: boolean;
  desktopPositionX?: number;
  desktopPositionY?: number;
  mobilePositionX?: number;
  mobilePositionY?: number;
  desktopZoom?: number;
  mobileZoom?: number;
};

export type UpdateHomepageHeroSlidePayload = {
  title?: string;
  altText?: string;
  displayOrder?: number;
  isPublished?: boolean;
  desktopPositionX?: number;
  desktopPositionY?: number;
  mobilePositionX?: number;
  mobilePositionY?: number;
  desktopZoom?: number;
  mobileZoom?: number;
};

export type UploadedHomepageImage = {
  id: string;
  url: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
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

    if (Array.isArray(data.message)) {
      return data.message.join(' ');
    }

    return data.message || fallback;
  } catch {
    return fallback;
  }
}

export async function getPublicHomepageHeroSlides(): Promise<
  HomepageHeroSlide[]
> {
  try {
    const response =
      await fetch(
        `${API_URL}/homepage-hero/public`,
        {
          cache:
            'no-store',

          signal:
            AbortSignal.timeout(
              5000,
            ),
        },
      );

    if (!response.ok) {
      return [];
    }

    return (
      await response.json()
    ) as HomepageHeroSlide[];
  } catch {
    return [];
  }
}

export async function getAdminHomepageHeroSlides(): Promise<
  HomepageHeroSlide[]
> {
  const response =
    await apiFetch(
      '/homepage-hero/admin',
      {
        cache: 'no-store',
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible de charger les images de la page d’accueil.',
      ),
    );
  }

  return await response.json() as HomepageHeroSlide[];
}

export async function uploadHomepageHeroImage(
  file: File,
): Promise<UploadedHomepageImage> {
  const formData = new FormData();

  formData.append(
    'file',
    file,
  );

  const response =
    await apiFetch(
      '/media/admin/homepage-images',
      {
        method: 'POST',
        body: formData,
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible d’importer cette image.',
      ),
    );
  }

  return await response.json() as UploadedHomepageImage;
}

export async function createHomepageHeroSlide(
  payload: CreateHomepageHeroSlidePayload,
): Promise<HomepageHeroSlide> {
  const response =
    await apiFetch(
      '/homepage-hero/admin',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible d’ajouter cette image au diaporama.',
      ),
    );
  }

  return await response.json() as HomepageHeroSlide;
}

export async function updateHomepageHeroSlide(
  id: string,
  payload: UpdateHomepageHeroSlidePayload,
): Promise<HomepageHeroSlide> {
  const response =
    await apiFetch(
      `/homepage-hero/admin/${id}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible de modifier cette image.',
      ),
    );
  }

  return await response.json() as HomepageHeroSlide;
}

export async function deleteHomepageHeroSlide(
  id: string,
): Promise<void> {
  const response =
    await apiFetch(
      `/homepage-hero/admin/${id}`,
      {
        method: 'DELETE',
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible de supprimer cette image.',
      ),
    );
  }
}

export async function reorderHomepageHeroSlides(
  slideIds: string[],
): Promise<HomepageHeroSlide[]> {
  const response =
    await apiFetch(
      '/homepage-hero/admin/reorder',
      {
        method: 'PATCH',
        body: JSON.stringify({
          slideIds,
        }),
      },
    );

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(
        response,
        'Impossible de modifier l’ordre des images.',
      ),
    );
  }

  return await response.json() as HomepageHeroSlide[];
}
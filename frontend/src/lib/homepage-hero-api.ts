import {
  API_URL,
} from '@/lib/api';

import type {
  HomepageHeroSlide,
} from '@/types/homepage-hero';

export async function getPublicHomepageHeroSlides(): Promise<
  HomepageHeroSlide[]
> {
  try {
    const response =
      await fetch(
        `${API_URL}/homepage-hero/public`,
        {
          cache: 'no-store',
        },
      );

    if (!response.ok) {
      return [];
    }

    return await response.json() as HomepageHeroSlide[];
  } catch {
    return [];
  }
}
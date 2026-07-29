import type {
  VideoFormState,
  VideoItem,
} from '@/types/videos';

export const EMPTY_VIDEO_FORM:
  VideoFormState = {
  title:
    '',

  slug:
    '',

  excerpt:
    '',

  description:
    '',

  provider:
    'YOUTUBE',

  externalUrl:
    '',

  mediaAssetId:
    '',

  mediaUrl:
    '',

  mediaOriginalFilename:
    '',

  thumbnailMediaAssetId:
    '',

  thumbnailUrl:
    '',

  thumbnailOriginalFilename:
    '',

  regionalAssociationId:
    '',

  seoTitle:
    '',

  seoDescription:
    '',

  displayOrder:
    '0',

  isFeatured:
    false,

  scheduledAt:
    '',
};

export function slugifyVideoTitle(
  value: string,
) {
  return value
    .normalize(
      'NFD',
    )
    .replace(
      /[\u0300-\u036f]/g,
      '',
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9]+/g,
      '-',
    )
    .replace(
      /^-+|-+$/g,
      '',
    )
    .slice(
      0,
      180,
    );
}

function isoToLocalDateTime(
  value?: string | null,
) {
  if (!value) {
    return '';
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return '';
  }

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
      offset * 60_000,
    );

  return localDate
    .toISOString()
    .slice(
      0,
      16,
    );
}

export function videoToForm(
  video: VideoItem,
): VideoFormState {
  return {
    title:
      video.title,

    slug:
      video.slug,

    excerpt:
      video.excerpt ??
      '',

    description:
      video.description ??
      '',

    provider:
      video.provider,

    externalUrl:
      video.externalUrl ??
      '',

    mediaAssetId:
      video.media?.id ??
      '',

    mediaUrl:
      video.media?.url ??
      '',

    mediaOriginalFilename:
      video.media?.originalFilename ??
      '',

    thumbnailMediaAssetId:
      video.thumbnail?.id ??
      '',

    thumbnailUrl:
      video.thumbnail?.url ??
      '',

    thumbnailOriginalFilename:
      '',

    regionalAssociationId:
      video.association?.id ??
      '',

    seoTitle:
      video.seo.title ??
      '',

    seoDescription:
      video.seo.description ??
      '',

    displayOrder:
      String(
        video.displayOrder ??
        0,
      ),

    isFeatured:
      video.isFeatured,

    scheduledAt:
      isoToLocalDateTime(
        video.scheduledAt,
      ),
  };
}
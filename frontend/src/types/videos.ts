export type VideoProvider =
  | 'YOUTUBE'
  | 'UPLOADED';

export type VideoSourceType =
  | 'STANDALONE'
  | 'NEWS';

export type VideoStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'REJECTED'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type VideoMedia = {
  id: string;
  mediaType: 'VIDEO' | 'IMAGE';
  mimeType: string;
  originalFilename: string;
  objectKey: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
  sizeBytes?: number | null;
};

export type VideoThumbnail = {
  id?: string | null;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

export type VideoAssociation = {
  id: string;
  name: string;
  acronym?: string | null;
  slug: string;
};

export type VideoItem = {
  id: string;

  title: string;
  slug: string;

  excerpt?: string | null;
  description?: string | null;

  sourceType: VideoSourceType;
  provider: VideoProvider;
  status: VideoStatus;

  externalUrl?: string | null;
  externalVideoId?: string | null;
  youtubeEmbedUrl?: string | null;

  media?: VideoMedia | null;
  thumbnail?: VideoThumbnail | null;

  association?: VideoAssociation | null;

  newsArticleId?: string | null;

  durationSeconds?: number | null;

  seo: {
    title?: string | null;
    description?: string | null;
  };

  displayOrder: number;
  isFeatured: boolean;

  publishedAt?: string | null;
  scheduledAt?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;

  createdAt: string;
  updatedAt: string;
};

export type VideoPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type VideoListResponse = {
  items: VideoItem[];
  pagination: VideoPagination;
};

export type PublicVideoFilters = {
  page?: number;
  limit?: number;
  search?: string;
  provider?: VideoProvider | '';
  associationSlug?: string;
};

export type VideoAdminFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: VideoStatus | '';
  provider?: VideoProvider | '';
  sourceType?: VideoSourceType | '';
  regionalAssociationId?: string;
};

export type VideoAssociationFilters = {
  page?: number;
  limit?: number;
  search?: string;
  status?: VideoStatus | '';
  provider?: VideoProvider | '';
};

export type VideoFormState = {
  title: string;
  slug: string;

  excerpt: string;
  description: string;

  provider: VideoProvider;

  externalUrl: string;

  mediaAssetId: string;
  mediaUrl: string;
  mediaOriginalFilename: string;

  thumbnailMediaAssetId: string;
  thumbnailUrl: string;
  thumbnailOriginalFilename: string;

  regionalAssociationId: string;

  seoTitle: string;
  seoDescription: string;

  displayOrder: string;
  isFeatured: boolean;

  scheduledAt: string;
};

export type UploadedVideoMedia = {
  id: string;
  url: string;
  mediaType: 'VIDEO';
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  associationId?: string | null;
};

export type UploadedVideoThumbnail = {
  id: string;
  url: string;
  mediaType: 'IMAGE';
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  associationId?: string | null;
};
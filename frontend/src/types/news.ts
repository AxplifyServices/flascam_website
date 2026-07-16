export type NewsContentType =
  | 'ACTUALITY'
  | 'EVENT'
  | 'OFFICIAL_RELEASE'
  | 'REGULATORY_PUBLICATION'
  | 'PRESS_REVIEW';

export type NewsEventCategory =
  | 'SALON_EXPOSITION'
  | 'CONFERENCE_SOMMET'
  | 'ASSEMBLEE_INSTITUTIONNELLE'
  | 'PRESSE_MEDIA'
  | 'PRIX_CONCOURS'
  | 'PARTENARIAT'
  | 'RENCONTRE_INSTITUTIONNELLE'
  | 'LANCEMENT_AUTOMOBILE'
  | 'FORMATION_ATELIER'
  | 'OTHER';

export type NewsStatus =
  | 'DRAFT'
  | 'PUBLISHED'
  | 'ARCHIVED';

export type NewsEventPeriod =
  | 'UPCOMING'
  | 'ONGOING'
  | 'PAST'
  | null;

export type NewsMediaType =
  | 'IMAGE'
  | 'VIDEO';

export type NewsMedia = {
  id: string;
  mediaAssetId: string;
  mediaType: NewsMediaType;
  mimeType: string;
  url: string;
  displayOrder: number;
  altText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  durationSeconds?: number | null;
};

export type NewsArticle = {
  id: string;
  contentType: NewsContentType;
  eventCategory?: NewsEventCategory | null;
  status: NewsStatus;
  title: string;
  slug: string;
  excerpt?: string | null;
  body?: string | null;
  eventStartAt?: string | null;
  eventEndAt?: string | null;
  eventLocation?: string | null;
  eventPeriod?: NewsEventPeriod;
  seoTitle?: string | null;
  seoDescription?: string | null;
  publishedAt?: string | null;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  media: NewsMedia[];
  primaryMedia?: NewsMedia | null;
};

export type NewsPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type NewsListResponse = {
  items: NewsArticle[];
  pagination: NewsPagination;
};

export type NewsAdminFilters = {
  page?: number;
  limit?: number;
  search?: string;
  contentType?: NewsContentType | '';
  status?: NewsStatus | '';
};

export type UploadedNewsMedia = {
  id: string;
  url: string;
  mediaType: NewsMediaType;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
};

export type NewsFormMedia = {
  localId: string;
  mediaAssetId: string;
  mediaType: NewsMediaType;
  url: string;
  originalFilename: string;
  altText: string;
  caption: string;
};

export type NewsFormState = {
  contentType: NewsContentType;
  eventCategory: NewsEventCategory | '';
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  eventStartAt: string;
  eventEndAt: string;
  eventLocation: string;
  seoTitle: string;
  seoDescription: string;
  media: NewsFormMedia[];
};
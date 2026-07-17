export type AssociationSummary = {
  id: string;
  name: string;
  slug: string;
  acronym?: string | null;
  region: string;
  city?: string | null;
  memberCount?: number | null;
  affiliatedSinceYear?: number | null;
  logoText?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  status?: string;
  isFeatured?: boolean;
  displayOrder?: number;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

export type AssociationPost = {
  id: string;

  associationId: string;

  contentType: string;

  eventCategory?: string | null;

  status: string;

  title: string;

  slug: string;

  excerpt?: string | null;

  body?: string | null;

  coverUrl?: string | null;

  coverAltText?: string | null;

  coverMediaAssetId?: string | null;

  eventStartAt?: string | null;

  eventEndAt?: string | null;

  eventLocation?: string | null;

  displayOrder?: number;

  seoTitle?: string | null;

  seoDescription?: string | null;

  publishedAt?: string | null;

  createdAt?: string | null;

  updatedAt?: string | null;
};

export type AssociationMediaItem = {
  id: string;
  associationId: string;
  mediaType: 'PHOTO' | 'VIDEO';
  mediaAssetId: string;
  title?: string | null;
  caption?: string | null;
  displayOrder?: number;
  isPublished?: boolean;
  url?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AssociationDetail = AssociationSummary & {
  logoMediaAssetId?: string | null;
  presentation?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
  linkedinUrl?: string | null;
  youtubeUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  actualities?: AssociationPost[];
  events?: AssociationPost[];
  photos?: AssociationMediaItem[];
  videos?: AssociationMediaItem[];
  posts?: AssociationPost[];
  mediaItems?: AssociationMediaItem[];
  adminAccount?: AssociationAdminAccount | null;
};

export type AssociationAdminAccount = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  lastLoginAt?: string | null;
};

export type AssociationFormState = {
  name: string;
  slug: string;
  acronym: string;
  region: string;
  city: string;
  memberCount: string;
  affiliatedSinceYear: string;
  logoMediaAssetId: string;
  coverImageUrl: string;
  logoText: string;
  presentation: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  isFeatured: boolean;
  displayOrder: string;
  seoTitle: string;
  seoDescription: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPassword: string;
};

export type OwnAssociationFormState = {
  name: string;
  acronym: string;
  region: string;
  city: string;
  memberCount: string;
  logoMediaAssetId: string;
  coverImageUrl: string;
  logoText: string;
  presentation: string;
  address: string;
  phone: string;
  email: string;
  websiteUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  youtubeUrl: string;
  seoTitle: string;
  seoDescription: string;
};

export type AssociationPostFormState = {
  contentType: 'ACTUALITY' | 'EVENT';
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  coverMediaAssetId: string;
  eventStartAt: string;
  eventEndAt: string;
  eventLocation: string;
  displayOrder: string;
  seoTitle: string;
  seoDescription: string;
};

export type AssociationMediaFormState = {
  mediaType: 'PHOTO' | 'VIDEO';
  mediaAssetId: string;
  title: string;
  caption: string;
  displayOrder: string;
  isPublished: boolean;
};
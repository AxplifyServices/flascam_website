export type HomepageHeroSlide = {
  id: string;
  mediaAssetId: string;
  imageUrl: string;
  title: string | null;
  altText: string;
  displayOrder: number;
  isPublished: boolean;
  desktopPositionX: number;
  desktopPositionY: number;
  mobilePositionX: number;
  mobilePositionY: number;
  desktopZoom: number;
  mobileZoom: number;
};
import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  CreateHomepageHeroSlideDto,
} from './dto/create-homepage-hero-slide.dto';

import {
  UpdateHomepageHeroSlideDto,
} from './dto/update-homepage-hero-slide.dto';

import type {
  HomepageHeroSlideResponse,
} from './homepage-hero.types';

import {
  ReorderHomepageHeroSlidesDto,
} from './dto/reorder-homepage-hero-slides.dto';

@Injectable()
export class HomepageHeroService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async getPublicSlides(): Promise<HomepageHeroSlideResponse[]> {
    const slides =
      await this.prisma.homepage_hero_slides.findMany({
        where: {
          is_published: true,
          media_assets: {
            deleted_at: null,
            status: 'PUBLISHED',
            visibility: 'PUBLIC',
          },
        },
        include: {
          media_assets: true,
        },
        orderBy: [
          {
            display_order: 'asc',
          },
          {
            created_at: 'asc',
          },
        ],
      });

    return slides.map((slide) =>
      this.mapSlide(slide),
    );
  }

  async getAdminSlides(): Promise<HomepageHeroSlideResponse[]> {
    const slides =
      await this.prisma.homepage_hero_slides.findMany({
        include: {
          media_assets: true,
        },
        orderBy: [
          {
            display_order: 'asc',
          },
          {
            created_at: 'asc',
          },
        ],
      });

    return slides.map((slide) =>
      this.mapSlide(slide),
    );
  }

  async createSlide(
    dto: CreateHomepageHeroSlideDto,
  ): Promise<HomepageHeroSlideResponse> {
    const mediaAsset =
      await this.prisma.media_assets.findFirst({
        where: {
          id: dto.mediaAssetId,
          deleted_at: null,
          media_type: 'IMAGE',
          visibility: 'PUBLIC',
          status: 'PUBLISHED',
        },
      });

    if (!mediaAsset) {
      throw new NotFoundException(
        'Image introuvable ou non publiée.',
      );
    }

    const slide =
      await this.prisma.homepage_hero_slides.create({
        data: {
          media_asset_id: dto.mediaAssetId,
          title: dto.title?.trim() || null,
          alt_text: dto.altText.trim(),
          display_order: dto.displayOrder ?? 0,
          is_published: dto.isPublished ?? true,
        },
        include: {
          media_assets: true,
        },
      });

    return this.mapSlide(slide);
  }

  async updateSlide(
    id: string,
    dto: UpdateHomepageHeroSlideDto,
  ): Promise<HomepageHeroSlideResponse> {
    const existing =
      await this.prisma.homepage_hero_slides.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Image du diaporama introuvable.',
      );
    }

    const slide =
      await this.prisma.homepage_hero_slides.update({
        where: {
          id,
        },
        data: {
          ...(dto.title !== undefined
            ? {
                title:
                  dto.title.trim() || null,
              }
            : {}),
          ...(dto.altText !== undefined
            ? {
                alt_text:
                  dto.altText.trim(),
              }
            : {}),
          ...(dto.displayOrder !== undefined
            ? {
                display_order:
                  dto.displayOrder,
              }
            : {}),
          ...(dto.isPublished !== undefined
            ? {
                is_published:
                  dto.isPublished,
              }
            : {}),
          updated_at: new Date(),
        },
        include: {
          media_assets: true,
        },
      });

    return this.mapSlide(slide);
  }

  async reorderSlides(
    dto: ReorderHomepageHeroSlidesDto,
  ): Promise<HomepageHeroSlideResponse[]> {
    const uniqueIds =
      [...new Set(dto.slideIds)];

    if (
      uniqueIds.length !==
      dto.slideIds.length
    ) {
      throw new NotFoundException(
        'La liste contient des images en double.',
      );
    }

    const existingSlides =
      await this.prisma.homepage_hero_slides.findMany({
        where: {
          id: {
            in: uniqueIds,
          },
        },
        select: {
          id: true,
        },
      });

    if (
      existingSlides.length !==
      uniqueIds.length
    ) {
      throw new NotFoundException(
        'Une ou plusieurs images du diaporama sont introuvables.',
      );
    }

    await this.prisma.$transaction(
      uniqueIds.map(
        (id, index) =>
          this.prisma.homepage_hero_slides.update({
            where: {
              id,
            },
            data: {
              display_order:
                index,
              updated_at:
                new Date(),
            },
          }),
      ),
    );

    return this.getAdminSlides();
  }  

  async deleteSlide(
    id: string,
  ): Promise<{
    success: true;
  }> {
    const existing =
      await this.prisma.homepage_hero_slides.findUnique({
        where: {
          id,
        },
      });

    if (!existing) {
      throw new NotFoundException(
        'Image du diaporama introuvable.',
      );
    }

    await this.prisma.homepage_hero_slides.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
    };
  }

  private mapSlide(
    slide: {
      id: string;
      media_asset_id: string;
      title: string | null;
      alt_text: string;
      display_order: number;
      is_published: boolean;

      media_assets: {
        object_key: string;
      };
    },
  ): HomepageHeroSlideResponse {
    return {
      id: slide.id,
      mediaAssetId:
        slide.media_asset_id,
      imageUrl: this.mediaUrl(
        slide.media_assets.object_key,
      ),
      title: slide.title,
      altText: slide.alt_text,
      displayOrder:
        slide.display_order,
      isPublished:
        slide.is_published,
    };
  }

  private mediaUrl(
    objectKey: string,
  ) {
    const baseUrl =
      this.config.get<string>(
        'PUBLIC_MEDIA_BASE_URL',
        '',
      );

    if (!baseUrl) {
      return objectKey;
    }

    return `${baseUrl.replace(/\/$/, '')}/${objectKey.replace(/^\//, '')}`;
  }
}
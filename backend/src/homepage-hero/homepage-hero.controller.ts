import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator';

import {
  Public,
} from '../auth/decorators/public.decorator';

import {
  CreateHomepageHeroSlideDto,
} from './dto/create-homepage-hero-slide.dto';

import {
  UpdateHomepageHeroSlideDto,
} from './dto/update-homepage-hero-slide.dto';

import {
  HomepageHeroService,
} from './homepage-hero.service';

import {
  ReorderHomepageHeroSlidesDto,
} from './dto/reorder-homepage-hero-slides.dto';

@Controller('homepage-hero')
export class HomepageHeroController {
  constructor(
    private readonly service: HomepageHeroService,
  ) {}

  @Public()
  @Get('public')
  getPublicSlides() {
    return this.service.getPublicSlides();
  }

  @Get('admin')
  @Permissions('homepage.manage')
  getAdminSlides() {
    return this.service.getAdminSlides();
  }

  @Post('admin')
  @Permissions('homepage.manage')
  createSlide(
    @Body()
    dto: CreateHomepageHeroSlideDto,
  ) {
    return this.service.createSlide(dto);
  }

  @Patch('admin/reorder')
  @Permissions('homepage.manage')
  reorderSlides(
    @Body()
    dto: ReorderHomepageHeroSlidesDto,
  ) {
    return this.service.reorderSlides(
      dto,
    );
  }  

  @Patch('admin/:id')
  @Permissions('homepage.manage')
  updateSlide(
    @Param('id')
    id: string,
    @Body()
    dto: UpdateHomepageHeroSlideDto,
  ) {
    return this.service.updateSlide(
      id,
      dto,
    );
  }

  @Delete('admin/:id')
  @Permissions('homepage.manage')
  deleteSlide(
    @Param('id')
    id: string,
  ) {
    return this.service.deleteSlide(id);
  }
}
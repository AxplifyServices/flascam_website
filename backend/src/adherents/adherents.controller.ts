import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';

import type {
  Request,
} from 'express';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import type {
  AuthUser,
} from '../auth/types/auth-user.type';

import {
  AdherentsService,
} from './adherents.service';

import {
  CreateAdherentDto,
} from './dto/create-adherent.dto';

import {
  UpdateAdherentStatusDto,
} from './dto/update-adherent-status.dto';

import {
  UpdateAdherentDto,
} from './dto/update-adherent.dto';

@Controller('adherents')
export class AdherentsController {
  constructor(
    private readonly adherentsService:
      AdherentsService,
  ) {}

  /*
   * Liste globale pour FLASCAM.
   */
  @Get('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'adherents.read',
  )
  findAllForFlascam(
    @CurrentUser()
    user: AuthUser,

    @Query('status')
    status?: string,
  ) {
    return this.adherentsService.findAll(
      user,
      status,
    );
  }

  /*
   * Liste limitée à l’association connectée.
   */
  @Get('association')
  @Roles(
    'ASSOCIATION_ADMIN',
  )
  @Permissions(
    'association.adherents.read',
  )
  findAllForAssociation(
    @CurrentUser()
    user: AuthUser,

    @Query('status')
    status?: string,
  ) {
    return this.adherentsService.findAll(
      user,
      status,
    );
  }

  @Get(':id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
  )
  findOne(
    @Param('id')
    id: string,

    @CurrentUser()
    user: AuthUser,
  ) {
    return this.adherentsService.findOne(
      id,
      user,
    );
  }

  /*
   * Création par FLASCAM.
   * regionalAssociationId est obligatoire.
   * approveImmediately peut être utilisé.
   */
  @Post('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'adherents.manage',
  )
  createForFlascam(
    @Body()
    dto: CreateAdherentDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.adherentsService.create(
      dto,
      user,
      request,
    );
  }

  /*
   * Création par une association.
   * regionalAssociationId et approveImmediately sont ignorés.
   */
  @Post('association')
  @Roles(
    'ASSOCIATION_ADMIN',
  )
  @Permissions(
    'association.adherents.create',
  )
  createForAssociation(
    @Body()
    dto: CreateAdherentDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.adherentsService.create(
      {
        ...dto,
        regionalAssociationId:
          undefined,
        approveImmediately:
          false,
      },
      user,
      request,
    );
  }

  /*
   * Une association peut corriger les informations
   * d’un adhérent de son périmètre.
   *
   * Elle ne peut pas changer son association ni son statut.
   */
  @Put(':id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
    'ASSOCIATION_ADMIN',
  )
  update(
    @Param('id')
    id: string,

    @Body()
    dto: UpdateAdherentDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    const safeDto =
      user.role ===
      'ASSOCIATION_ADMIN'
        ? {
            ...dto,
            regionalAssociationId:
              undefined,
          }
        : dto;

    return this.adherentsService.update(
      id,
      safeDto,
      user,
      request,
    );
  }

@Patch(':id/resubmit')
@Roles(
  'ASSOCIATION_ADMIN',
)
@Permissions(
  'association.adherents.create',
)
resubmit(
  @Param('id')
  id: string,

  @CurrentUser()
  user: AuthUser,

  @Req()
  request: Request,
) {
  return this.adherentsService.resubmit(
    id,
    user,
    request,
  );
}  

  /*
   * Validation, refus, suspension et réactivation :
   * exclusivement FLASCAM.
   */
  @Patch(':id/status')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'adherents.manage',
  )
  updateStatus(
    @Param('id')
    id: string,

    @Body()
    dto:
      UpdateAdherentStatusDto,

    @CurrentUser()
    user: AuthUser,

    @Req()
    request: Request,
  ) {
    return this.adherentsService.updateStatus(
      id,
      dto,
      user,
      request,
    );
  }
}
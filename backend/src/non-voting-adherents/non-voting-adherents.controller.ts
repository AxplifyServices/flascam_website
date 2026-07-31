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
  HttpCode,
} from '@nestjs/common';

import {
  Throttle,
} from '@nestjs/throttler';

import type {
  Request,
} from 'express';

import {
  CurrentUser,
} from '../auth/decorators/current-user.decorator';

import {
  Public,
} from '../auth/decorators/public.decorator';

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
  CreateNonVotingAdherentDto,
} from './dto/create-non-voting-adherent.dto';

import {
  NonVotingAdherentsQueryDto,
} from './dto/non-voting-adherents-query.dto';

import {
  RejectWafacashDto,
} from './dto/reject-wafacash.dto';

import {
  RegisterNonVotingAdherentDto,
} from './dto/register-non-voting-adherent.dto';

import {
  SubmitWafacashReferenceDto,
} from './dto/submit-wafacash-reference.dto';

import {
  SuspendNonVotingAdherentDto,
} from './dto/suspend-non-voting-adherent.dto';

import {
  UpdateNonVotingAdherentDto,
} from './dto/update-non-voting-adherent.dto';

import {
  NonVotingAdherentsService,
} from './non-voting-adherents.service';

@Controller(
  'non-voting-adherents',
)
export class NonVotingAdherentsController {
  constructor(
    private readonly service:
      NonVotingAdherentsService,
  ) {}

@Public()
@Get(
  'registration-config',
)
getRegistrationConfig() {
  return this.service.getRegistrationConfig();
}

@Public()
@HttpCode(201)
@Throttle({
  default: {
    limit:
      3,

    ttl:
      60_000,
  },
})
@Post(
  'register',
)
register(
  @Body()
  dto:
    RegisterNonVotingAdherentDto,

  @Req()
  request:
    Request,
) {
  return this.service.register(
    dto,
    request,
  );
}

  @Get('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.read',
  )
  findAll(
    @Query()
    query:
      NonVotingAdherentsQueryDto,
  ) {
    return this.service.findAll(
      query,
    );
  }

  @Get('me')
  @Roles(
    'MARKETPLACE_USER',
  )
  getMyProfile(
    @CurrentUser()
    user:
      AuthUser,
  ) {
    return this.service.getMyProfile(
      user,
    );
  }

  @Get('admin/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.read',
  )
  findOne(
    @Param('id')
    id:
      string,
  ) {
    return this.service.findOne(
      id,
    );
  }

  @Post('admin')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.manage',
  )
  create(
    @Body()
    dto:
      CreateNonVotingAdherentDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.create(
      dto,
      user,
      request,
    );
  }

  @Put('admin/:id')
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.manage',
  )
  update(
    @Param('id')
    id:
      string,

    @Body()
    dto:
      UpdateNonVotingAdherentDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.update(
      id,
      dto,
      user,
      request,
    );
  }

  @Patch(
    'me/wafacash-reference',
  )
  @Roles(
    'MARKETPLACE_USER',
  )
  submitWafacashReference(
    @Body()
    dto:
      SubmitWafacashReferenceDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.submitWafacashReference(
      dto,
      user,
      request,
    );
  }

  @Patch(
    'admin/:id/wafacash/approve',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.manage',
  )
  approveWafacash(
    @Param('id')
    id:
      string,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.approveWafacash(
      id,
      user,
      request,
    );
  }

  @Patch(
    'admin/:id/wafacash/reject',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.manage',
  )
  rejectWafacash(
    @Param('id')
    id:
      string,

    @Body()
    dto:
      RejectWafacashDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.rejectWafacash(
      id,
      dto,
      user,
      request,
    );
  }

  @Patch(
    'admin/:id/suspend',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.manage',
  )
  suspend(
    @Param('id')
    id:
      string,

    @Body()
    dto:
      SuspendNonVotingAdherentDto,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.suspend(
      id,
      dto,
      user,
      request,
    );
  }

  @Patch(
    'admin/:id/reactivate',
  )
  @Roles(
    'SUPER_ADMIN',
    'FLASCAM_ADMIN',
  )
  @Permissions(
    'non_voting_adherents.manage',
  )
  reactivate(
    @Param('id')
    id:
      string,

    @CurrentUser()
    user:
      AuthUser,

    @Req()
    request:
      Request,
  ) {
    return this.service.reactivate(
      id,
      user,
      request,
    );
  }
}
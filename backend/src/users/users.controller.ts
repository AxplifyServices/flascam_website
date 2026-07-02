import {
  Controller,
  Get,
} from '@nestjs/common';

import {
  Permissions,
} from '../auth/decorators/permissions.decorator';

import {
  Roles,
} from '../auth/decorators/roles.decorator';

import {
  UsersService,
} from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService:
      UsersService,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  @Permissions('users.read')
  findAll() {
    return this.usersService.findAll();
  }
}
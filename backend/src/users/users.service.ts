import { Injectable } from '@nestjs/common';

import {
  PrismaService,
} from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma:
      PrismaService,
  ) {}

  findAll() {
    return this.prisma.users.findMany({
      where: {
        deleted_at: null,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        is_active: true,
        last_login_at: true,
        created_at: true,
        roles: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }
}
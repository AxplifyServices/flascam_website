import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import {
  PassportStrategy,
} from '@nestjs/passport';

import type { Request } from 'express';

import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  PrismaService,
} from '../../prisma/prisma.service';

import type {
  AuthUser,
} from '../types/auth-user.type';

type AccessTokenPayload = {
  sub: string;
  type: 'access';
  iat: number;
  exp: number;
};

@Injectable()
export class JwtStrategy
  extends PassportStrategy(Strategy)
{
  constructor(
    configService: ConfigService,
    private readonly prisma:
      PrismaService,
  ) {
    const secret =
      configService.get<string>(
        'JWT_ACCESS_SECRET',
      );

    if (!secret) {
      throw new Error(
        'JWT_ACCESS_SECRET est absente.',
      );
    }

    super({
      jwtFromRequest:
        ExtractJwt.fromExtractors([
          (request: Request) =>
            request?.cookies
              ?.flascam_access_token ??
            null,
        ]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(
    payload: AccessTokenPayload,
  ): Promise<AuthUser> {
    if (payload.type !== 'access') {
      throw new UnauthorizedException();
    }

    const user =
      await this.prisma.users.findFirst({
        where: {
          id: payload.sub,
          is_active: true,
          deleted_at: null,
        },
        select: {
          id: true,
          email: true,
          roles: {
            select: {
              code: true,
              role_permissions: {
                select: {
                  permissions: {
                    select: {
                      code: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Session invalide.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.roles.code,
      permissions:
        user.roles.role_permissions.map(
          (item) =>
            item.permissions.code,
        ),
    };
  }
}
import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import {
  ConfigService,
} from '@nestjs/config';

import {
  JwtService,
} from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import {
  createHash,
  randomUUID,
} from 'crypto';

import type {
  Request,
  Response,
} from 'express';

import {
  AuditLogsService,
} from '../audit-logs/audit-logs.service';

import {
  PrismaService,
} from '../prisma/prisma.service';

import {
  LoginDto,
} from './dto/login.dto';

const ACCESS_COOKIE =
  'flascam_access_token';

const REFRESH_COOKIE =
  'flascam_refresh_token';

type RefreshTokenPayload = {
  sub: string;
  jti: string;
  type: 'refresh';
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma:
      PrismaService,
    private readonly jwt:
      JwtService,
    private readonly config:
      ConfigService,
    private readonly audit:
      AuditLogsService,
  ) {}

  async login(
    dto: LoginDto,
    request: Request,
    response: Response,
  ) {
    const user =
      await this.prisma.users.findFirst({
        where: {
          email: dto.email,
          deleted_at: null,
        },
        include: {
          roles: true,
        },
      });

    const passwordIsValid =
      user
        ? await bcrypt.compare(
            dto.password,
            user.password_hash,
          )
        : false;

    if (
      !user ||
      !passwordIsValid ||
      !user.is_active
    ) {
      await this.audit.log({
        userId: user?.id,
        action:
          'AUTH_LOGIN_FAILED',
        entityType: 'USER',
        entityId: user?.id,
        description:
          'Échec de connexion.',
        metadata: {
          email: dto.email,
        },
        ipAddress:
          this.getIp(request),
        userAgent:
          request.get(
            'user-agent',
          ),
      });

      throw new UnauthorizedException(
        'Identifiants invalides.',
      );
    }

    await this.prisma
      .refresh_tokens
      .updateMany({
        where: {
          user_id: user.id,
          revoked_at: null,
          expires_at: {
            lt: new Date(),
          },
        },
        data: {
          revoked_at: new Date(),
        },
      });

    await this.issueSession(
      user.id,
      request,
      response,
    );

    await this.prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        last_login_at: new Date(),
      },
    });

    await this.audit.log({
      userId: user.id,
      action:
        'AUTH_LOGIN_SUCCESS',
      entityType: 'USER',
      entityId: user.id,
      description:
        'Connexion réussie.',
      ipAddress:
        this.getIp(request),
      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return {
      user:
        await this.getSafeUser(
          user.id,
        ),
    };
  }

  async refresh(
    request: Request,
    response: Response,
  ) {
    const refreshToken =
      request.cookies?.[
        REFRESH_COOKIE
      ] as string | undefined;

    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token absent.',
      );
    }

    let payload:
      RefreshTokenPayload;

    try {
      payload =
        await this.jwt.verifyAsync<
          RefreshTokenPayload
        >(
          refreshToken,
          {
            secret:
              this.getRequired(
                'JWT_REFRESH_SECRET',
              ),
          },
        );
    } catch {
      this.clearCookies(
        response,
      );

      throw new UnauthorizedException(
        'Refresh token invalide.',
      );
    }

    if (
      payload.type !== 'refresh'
    ) {
      throw new UnauthorizedException(
        'Refresh token invalide.',
      );
    }

    const storedToken =
      await this.prisma
        .refresh_tokens
        .findUnique({
          where: {
            token_hash:
              this.hash(
                refreshToken,
              ),
          },
          include: {
            users: true,
          },
        });

    if (
      !storedToken ||
      storedToken.revoked_at ||
      storedToken.expires_at <=
        new Date() ||
      storedToken.user_id !==
        payload.sub ||
      !storedToken.users
        .is_active ||
      storedToken.users.deleted_at
    ) {
      this.clearCookies(
        response,
      );

      throw new UnauthorizedException(
        'Session expirée ou révoquée.',
      );
    }

    await this.prisma
      .refresh_tokens
      .update({
        where: {
          id: storedToken.id,
        },
        data: {
          revoked_at: new Date(),
        },
      });

    await this.issueSession(
      storedToken.user_id,
      request,
      response,
    );

    return {
      user:
        await this.getSafeUser(
          storedToken.user_id,
        ),
    };
  }

  async logout(
    userId: string | undefined,
    request: Request,
    response: Response,
  ) {
    const refreshToken =
      request.cookies?.[
        REFRESH_COOKIE
      ] as string | undefined;

    if (refreshToken) {
      await this.prisma
        .refresh_tokens
        .updateMany({
          where: {
            token_hash:
              this.hash(
                refreshToken,
              ),
            revoked_at: null,
          },
          data: {
            revoked_at:
              new Date(),
          },
        });
    }

    this.clearCookies(response);

    await this.audit.log({
      userId,
      action: 'AUTH_LOGOUT',
      entityType: 'USER',
      entityId: userId,
      description:
        'Déconnexion.',
      ipAddress:
        this.getIp(request),
      userAgent:
        request.get(
          'user-agent',
        ),
    });

    return {
      success: true,
    };
  }

  async me(userId: string) {
    return {
      user:
        await this.getSafeUser(
          userId,
        ),
    };
  }

  private async issueSession(
    userId: string,
    request: Request,
    response: Response,
  ) {
    const accessToken =
      await this.jwt.signAsync(
        {
          sub: userId,
          type: 'access',
        },
        {
          secret:
            this.getRequired(
              'JWT_ACCESS_SECRET',
            ),
          expiresIn:
            this.config.get<string>(
              'JWT_ACCESS_EXPIRES_IN',
              '15m',
            ) as never,
        },
      );

    const refreshTokenId =
      randomUUID();

    const refreshExpiresIn =
      this.config.get<string>(
        'JWT_REFRESH_EXPIRES_IN',
        '7d',
      );

    const refreshToken =
      await this.jwt.signAsync(
        {
          sub: userId,
          jti: refreshTokenId,
          type: 'refresh',
        },
        {
          secret:
            this.getRequired(
              'JWT_REFRESH_SECRET',
            ),
          expiresIn:
            refreshExpiresIn as never,
        },
      );

    const decoded =
      this.jwt.decode(
        refreshToken,
      ) as {
        exp: number;
      };

    await this.prisma
      .refresh_tokens
      .create({
        data: {
          user_id: userId,
          token_hash:
            this.hash(
              refreshToken,
            ),
          expires_at:
            new Date(
              decoded.exp * 1000,
            ),
          ip_address:
            this.getIp(request),
          user_agent:
            request.get(
              'user-agent',
            ),
        },
      });

    response.cookie(
      ACCESS_COOKIE,
      accessToken,
      this.cookieOptions(
        this.durationMs(
          'JWT_ACCESS_EXPIRES_IN',
          15 * 60_000,
        ),
      ),
    );

    response.cookie(
      REFRESH_COOKIE,
      refreshToken,
      this.cookieOptions(
        this.durationMs(
          'JWT_REFRESH_EXPIRES_IN',
          7 * 86_400_000,
        ),
        '/api/auth',
      ),
    );
  }

  private async getSafeUser(
    id: string,
  ) {
    const user =
      await this.prisma.users
        .findUniqueOrThrow({
          where: {
            id,
          },
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            is_active: true,
            last_login_at: true,
            roles: {
              select: {
                code: true,
                name: true,
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

    return {
      id: user.id,
      email: user.email,
      firstName:
        user.first_name,
      lastName:
        user.last_name,
      isActive:
        user.is_active,
      lastLoginAt:
        user.last_login_at,
      role: {
        code:
          user.roles.code,
        name:
          user.roles.name,
      },
      permissions:
        user.roles
          .role_permissions
          .map(
            (item) =>
              item.permissions
                .code,
          ),
    };
  }

  private cookieOptions(
    maxAge: number,
    path = '/',
  ) {
    return {
      httpOnly: true,
      secure:
        this.config.get<string>(
          'COOKIE_SECURE',
          'false',
        ) === 'true',
      sameSite:
        this.config.get<
          'lax' |
          'strict' |
          'none'
        >(
          'COOKIE_SAME_SITE',
          'lax',
        ),
      domain:
        this.config.get<string>(
          'COOKIE_DOMAIN',
        ) || undefined,
      path,
      maxAge,
    } as const;
  }

  private clearCookies(
    response: Response,
  ) {
    response.clearCookie(
      ACCESS_COOKIE,
      this.cookieOptions(0),
    );

    response.clearCookie(
      REFRESH_COOKIE,
      this.cookieOptions(
        0,
        '/api/auth',
      ),
    );
  }

  private hash(
    token: string,
  ) {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  private getIp(
    request: Request,
  ) {
    return (
      request.ip ||
      request.socket
        .remoteAddress
    );
  }

  private getRequired(
    name: string,
  ) {
    const value =
      this.config.get<string>(
        name,
      );

    if (!value) {
      throw new Error(
        `${name} est absente.`,
      );
    }

    return value;
  }

  private durationMs(
    variableName: string,
    fallback: number,
  ) {
    const value =
      this.config.get<string>(
        variableName,
      );

    if (!value) {
      return fallback;
    }

    const match =
      value.match(
        /^(\d+)(s|m|h|d)$/,
      );

    if (!match) {
      return fallback;
    }

    const amount =
      Number(match[1]);

    const multipliers = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };

    return (
      amount *
      multipliers[
        match[2] as keyof
          typeof multipliers
      ]
    );
  }
}
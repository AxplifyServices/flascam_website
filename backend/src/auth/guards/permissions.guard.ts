import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import {
  PERMISSIONS_KEY,
} from '../decorators/permissions.decorator';

import type {
  RequestWithUser,
} from '../types/request-with-user.type';

@Injectable()
export class PermissionsGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<
        string[]
      >(
        PERMISSIONS_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (
      !requiredPermissions?.length
    ) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<RequestWithUser>();

    const grantedPermissions =
      new Set(
        request.user?.permissions ?? [],
      );

    const isAllowed =
      requiredPermissions.every(
        (permission) =>
          grantedPermissions.has(
            permission,
          ),
      );

    if (!isAllowed) {
      throw new ForbiddenException(
        'Permission insuffisante.',
      );
    }

    return true;
  }
}
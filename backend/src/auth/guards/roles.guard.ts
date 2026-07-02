import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { Reflector } from '@nestjs/core';

import {
  ROLES_KEY,
} from '../decorators/roles.decorator';

import type {
  RequestWithUser,
} from '../types/request-with-user.type';

@Injectable()
export class RolesGuard
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<
        string[]
      >(
        ROLES_KEY,
        [
          context.getHandler(),
          context.getClass(),
        ],
      );

    if (!requiredRoles?.length) {
      return true;
    }

    const request =
      context
        .switchToHttp()
        .getRequest<RequestWithUser>();

    if (
      !request.user ||
      !requiredRoles.includes(
        request.user.role,
      )
    ) {
      throw new ForbiddenException(
        'Accès refusé pour ce rôle.',
      );
    }

    return true;
  }
}
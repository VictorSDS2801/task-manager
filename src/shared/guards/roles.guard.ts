import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { WorkspaceRole } from '../types/workspace-role.enum';
import { CurrentUserPayload } from '../decorators/current-user.decorator';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: WorkspaceRole[]) =>
  Reflect.metadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<WorkspaceRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user: CurrentUserPayload }>();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    const hasRole = requiredRoles.includes(user.role as WorkspaceRole);

    if (!hasRole) {
      throw new ForbiddenException(
        `Acesso negado. Roles permitidas: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}

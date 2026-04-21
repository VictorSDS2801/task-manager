import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import type { CurrentUserPayload } from '../decorators/current-user.decorator';
import { AuditLogRepository } from '../../modules/audit/infrastructure/audit-log.repository';

const MUTATING_METHODS = ['POST', 'PATCH', 'PUT', 'DELETE'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: CurrentUserPayload }>();

    const { method, path, user } = request;

    if (
      !MUTATING_METHODS.includes(method) ||
      !user?.sub ||
      !user?.workspaceId
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        this.auditLogRepository
          .create({
            userId: user.sub,
            workspaceId: user.workspaceId,
            action: `${method} ${path}`,
            path,
            method,
          })
          .catch((err: unknown) =>
            this.logger.error('Erro ao gravar AuditLog', err),
          );
      }),
    );
  }
}

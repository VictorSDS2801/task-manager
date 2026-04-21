import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuditLog, AuditLogSchema } from './domain/audit-log.schema';
import { AuditLogRepository } from './infrastructure/audit-log.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuditLog.name, schema: AuditLogSchema },
    ]),
  ],
  providers: [AuditLogRepository],
  exports: [AuditLogRepository],
})
export class AuditModule {}

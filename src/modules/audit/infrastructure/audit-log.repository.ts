import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuditLog, AuditLogDocument } from '../domain/audit-log.schema';

export interface CreateAuditLogDto {
  userId: string;
  workspaceId: string;
  action: string;
  path: string;
  method: string;
}

@Injectable()
export class AuditLogRepository {
  constructor(
    @InjectModel(AuditLog.name)
    private readonly model: Model<AuditLogDocument>,
  ) {}

  async create(data: CreateAuditLogDto): Promise<AuditLogDocument> {
    return this.model.create({
      ...data,
      userId: new Types.ObjectId(data.userId),
      workspaceId: new Types.ObjectId(data.workspaceId),
      timestamp: new Date(),
    });
  }

  async findByWorkspace(workspaceId: string): Promise<AuditLogDocument[]> {
    return this.model
      .find({ workspaceId: new Types.ObjectId(workspaceId) })
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();
  }
}

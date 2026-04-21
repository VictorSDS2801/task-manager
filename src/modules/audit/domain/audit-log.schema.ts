import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: false })
export class AuditLog {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true })
  path!: string;

  @Prop({ required: true })
  method!: string;

  @Prop({ required: true, default: () => new Date() })
  timestamp!: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ workspaceId: 1, timestamp: -1 });

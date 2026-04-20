import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

export type InviteDocument = HydratedDocument<Invite>;

@Schema({ timestamps: true })
export class Invite {
  @Prop({ required: true, lowercase: true, trim: true })
  email!: string;

  @Prop({ required: true })
  token!: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, enum: WorkspaceRole, default: WorkspaceRole.MEMBER })
  role!: WorkspaceRole;

  @Prop({ default: false })
  accepted!: boolean;

  @Prop({ required: true })
  expiresAt!: Date;
}

export const InviteSchema = SchemaFactory.createForClass(Invite);

InviteSchema.index({ token: 1 }, { unique: true });
InviteSchema.index({ workspaceId: 1 });
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

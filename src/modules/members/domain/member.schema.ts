import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

export type MemberDocument = HydratedDocument<Member>;

@Schema({ timestamps: true })
export class Member {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Workspace' })
  workspaceId!: Types.ObjectId;

  @Prop({ required: true, enum: WorkspaceRole, default: WorkspaceRole.MEMBER })
  role!: WorkspaceRole;
}

export const MemberSchema = SchemaFactory.createForClass(Member);

MemberSchema.index({ userId: 1, workspaceId: 1 }, { unique: true });
MemberSchema.index({ workspaceId: 1 });

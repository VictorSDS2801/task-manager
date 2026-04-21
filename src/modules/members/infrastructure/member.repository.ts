import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Member, MemberDocument } from '../domain/member.schema';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

@Injectable()
export class MemberRepository {
  constructor(
    @InjectModel(Member.name)
    private readonly model: Model<MemberDocument>,
  ) {}

  async create(
    userId: string,
    workspaceId: string,
    role: WorkspaceRole,
  ): Promise<MemberDocument> {
    return this.model.create({ userId, workspaceId, role });
  }

  async findByWorkspace(workspaceId: string): Promise<MemberDocument[]> {
    return this.model
      .find({ workspaceId })
      .populate('userId', 'name email')
      .exec();
  }

  async findOne(
    userId: string,
    workspaceId: string,
  ): Promise<MemberDocument | null> {
    return this.model.findOne({ userId, workspaceId }).exec();
  }

  async updateRole(
    userId: string,
    workspaceId: string,
    role: WorkspaceRole,
  ): Promise<MemberDocument | null> {
    return this.model
      .findOneAndUpdate({ userId, workspaceId }, { role }, { new: true })
      .exec();
  }

  async delete(userId: string, workspaceId: string): Promise<void> {
    await this.model.findOneAndDelete({ userId, workspaceId }).exec();
  }

  async deleteAllFromWorkspace(workspaceId: string): Promise<void> {
    await this.model.deleteMany({ workspaceId }).exec();
  }

  async findByUser(userId: string): Promise<MemberDocument[]> {
    return this.model.find({ userId }).exec();
  }
}

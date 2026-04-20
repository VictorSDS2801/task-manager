import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Invite, InviteDocument } from '../domain/invite.schema';

@Injectable()
export class InviteRepository {
  constructor(
    @InjectModel(Invite.name)
    private readonly model: Model<InviteDocument>,
  ) {}

  async create(data: Partial<Invite>): Promise<InviteDocument> {
    return this.model.create(data);
  }

  async findByToken(token: string): Promise<InviteDocument | null> {
    return this.model.findOne({ token }).exec();
  }

  async findByWorkspace(workspaceId: string): Promise<InviteDocument[]> {
    return this.model.find({ workspaceId }).exec();
  }

  async markAccepted(token: string): Promise<void> {
    await this.model.findOneAndUpdate({ token }, { accepted: true }).exec();
  }
}

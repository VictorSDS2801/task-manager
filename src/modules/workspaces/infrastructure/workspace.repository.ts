import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workspace, WorkspaceDocument } from '../domain/workspace.schema';
import { CreateWorkspaceDto } from '../application/dto/create-workspace.dto';

@Injectable()
export class WorkspaceRepository {
  constructor(
    @InjectModel(Workspace.name)
    private readonly model: Model<WorkspaceDocument>,
  ) {}

  async create(
    dto: CreateWorkspaceDto,
    ownerId: string,
    slug: string,
  ): Promise<WorkspaceDocument> {
    const exists = await this.model.findOne({ slug }).lean();
    if (exists) {
      throw new ConflictException('Slug já utilizado');
    }
    return this.model.create({ ...dto, slug, ownerId });
  }

  async findById(id: string): Promise<WorkspaceDocument | null> {
    return this.model.findById(id).exec();
  }

  async findByOwner(ownerId: string): Promise<WorkspaceDocument[]> {
    return this.model.find({ ownerId }).exec();
  }

  async update(
    id: string,
    data: Partial<Workspace>,
  ): Promise<WorkspaceDocument | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }
}

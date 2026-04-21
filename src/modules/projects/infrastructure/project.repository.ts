import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument } from '../domain/project.schema';

@Injectable()
export class ProjectRepository {
  constructor(
    @InjectModel(Project.name)
    private readonly model: Model<ProjectDocument>,
  ) {}

  async create(name: string, workspaceId: string): Promise<ProjectDocument> {
    return this.model.create({ name, workspaceId });
  }

  async findByWorkspace(workspaceId: string): Promise<ProjectDocument[]> {
    return this.model.find({ workspaceId }).exec();
  }

  async findOne(
    id: string,
    workspaceId: string,
  ): Promise<ProjectDocument | null> {
    return this.model.findOne({ _id: id, workspaceId }).exec();
  }

  async update(
    id: string,
    workspaceId: string,
    name: string,
  ): Promise<ProjectDocument | null> {
    return this.model
      .findOneAndUpdate({ _id: id, workspaceId }, { name }, { new: true })
      .exec();
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.model.findOneAndDelete({ _id: id, workspaceId }).exec();
  }
}

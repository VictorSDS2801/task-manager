import { Injectable, NotFoundException } from '@nestjs/common';
import { ProjectRepository } from '../infrastructure/project.repository';
import { CreateProjectDto } from '../application/dto/create-project.dto';
import { UpdateProjectDto } from '../application/dto/update-project.dto';
import { ProjectDocument } from './project.schema';

@Injectable()
export class ProjectService {
  constructor(private readonly projectRepository: ProjectRepository) {}

  async create(
    dto: CreateProjectDto,
    workspaceId: string,
  ): Promise<ProjectDocument> {
    return this.projectRepository.create(dto.name, workspaceId);
  }

  async findAll(workspaceId: string): Promise<ProjectDocument[]> {
    return this.projectRepository.findByWorkspace(workspaceId);
  }

  async findOne(id: string, workspaceId: string): Promise<ProjectDocument> {
    const project = await this.projectRepository.findOne(id, workspaceId);
    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }
    return project;
  }

  async update(
    id: string,
    workspaceId: string,
    dto: UpdateProjectDto,
  ): Promise<ProjectDocument> {
    const updated = await this.projectRepository.update(
      id,
      workspaceId,
      dto.name ?? '',
    );
    if (!updated) {
      throw new NotFoundException('Projeto não encontrado');
    }
    return updated;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.findOne(id, workspaceId);
    await this.projectRepository.delete(id, workspaceId);
  }
}

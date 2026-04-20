import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WorkspaceRepository } from '../infrastructure/workspace.repository';
import { MemberRepository } from '../../members/infrastructure/member.repository';
import { CreateWorkspaceDto } from '../application/dto/create-workspace.dto';
import { UpdateWorkspaceDto } from '../application/dto/update-workspace.dto';
import { WorkspaceDocument } from './workspace.schema';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

@Injectable()
export class WorkspaceService {
  constructor(
    private readonly workspaceRepository: WorkspaceRepository,
    private readonly memberRepository: MemberRepository,
  ) {}

  private generateSlug(name: string, custom?: string): string {
    const base = custom ?? name;
    return base
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  async create(
    dto: CreateWorkspaceDto,
    ownerId: string,
  ): Promise<WorkspaceDocument> {
    const slug = this.generateSlug(dto.name, dto.slug);
    const workspace = await this.workspaceRepository.create(dto, ownerId, slug);

    await this.memberRepository.create(
      ownerId,
      workspace._id.toString(),
      WorkspaceRole.OWNER,
    );

    return workspace;
  }

  async findById(id: string): Promise<WorkspaceDocument> {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException('Workspace não encontrado');
    }
    return workspace;
  }

  async update(
    id: string,
    dto: UpdateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceDocument> {
    const workspace = await this.findById(id);

    if (workspace.ownerId.toString() !== userId) {
      throw new ForbiddenException('Apenas o owner pode editar o workspace');
    }

    const updated = await this.workspaceRepository.update(id, dto);
    if (!updated) {
      throw new NotFoundException('Workspace não encontrado');
    }
    return updated;
  }

  async delete(id: string, userId: string): Promise<void> {
    const workspace = await this.findById(id);

    if (workspace.ownerId.toString() !== userId) {
      throw new ForbiddenException('Apenas o owner pode deletar o workspace');
    }

    await this.memberRepository.deleteAllFromWorkspace(id);
    await this.workspaceRepository.delete(id);
  }
}

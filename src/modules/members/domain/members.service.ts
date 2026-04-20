import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRepository } from '../infrastructure/member.repository';
import { UpdateMemberRoleDto } from '../application/dto/update-member-role.dto';
import { MemberDocument } from './member.schema';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

@Injectable()
export class MembersService {
  constructor(private readonly memberRepository: MemberRepository) {}

  async findAll(workspaceId: string): Promise<MemberDocument[]> {
    return this.memberRepository.findByWorkspace(workspaceId);
  }

  async updateRole(
    targetUserId: string,
    workspaceId: string,
    dto: UpdateMemberRoleDto,
    requestingRole: WorkspaceRole,
  ): Promise<MemberDocument> {
    if (
      requestingRole !== WorkspaceRole.OWNER &&
      requestingRole !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException('Apenas owner ou admin podem alterar roles');
    }

    if (dto.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Não é possível promover para owner');
    }

    const updated = await this.memberRepository.updateRole(
      targetUserId,
      workspaceId,
      dto.role,
    );

    if (!updated) {
      throw new NotFoundException('Membro não encontrado');
    }

    return updated;
  }

  async remove(
    targetUserId: string,
    workspaceId: string,
    requestingUserId: string,
    requestingRole: WorkspaceRole,
  ): Promise<void> {
    if (targetUserId === requestingUserId) {
      throw new ForbiddenException('Você não pode remover a si mesmo');
    }

    if (
      requestingRole !== WorkspaceRole.OWNER &&
      requestingRole !== WorkspaceRole.ADMIN
    ) {
      throw new ForbiddenException(
        'Apenas owner ou admin podem remover membros',
      );
    }

    const member = await this.memberRepository.findOne(
      targetUserId,
      workspaceId,
    );

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    if (member.role === WorkspaceRole.OWNER) {
      throw new ForbiddenException('Não é possível remover o owner');
    }

    await this.memberRepository.delete(targetUserId, workspaceId);
  }
}

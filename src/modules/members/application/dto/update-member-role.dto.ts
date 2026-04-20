import { IsEnum } from 'class-validator';
import { WorkspaceRole } from '../../../../shared/types/workspace-role.enum';

export class UpdateMemberRoleDto {
  @IsEnum(WorkspaceRole, { message: 'Role inválida' })
  role!: WorkspaceRole;
}

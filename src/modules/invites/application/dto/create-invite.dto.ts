import { IsEmail, IsEnum, IsOptional } from 'class-validator';
import { WorkspaceRole } from '../../../../shared/types/workspace-role.enum';

export class CreateInviteDto {
  @IsEmail({}, { message: 'E-mail inválido' })
  email!: string;

  @IsOptional()
  @IsEnum(WorkspaceRole, { message: 'Role inválida' })
  role?: WorkspaceRole;
}

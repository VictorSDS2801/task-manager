import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../shared/guards/roles.guard';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import { CurrentWorkspace } from '../../../shared/decorators/current-workspace.decorator';
import { MembersService } from '../domain/members.service';
import { UpdateMemberRoleDto } from '../application/dto/update-member-role.dto';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

@Controller('workspaces/:workspaceId/members')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Get()
  async findAll(@CurrentWorkspace() workspaceId: string) {
    return this.membersService.findAll(workspaceId);
  }

  @Patch(':userId/role')
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async updateRole(
    @Param('userId') userId: string,
    @CurrentWorkspace() workspaceId: string,
    @Body() dto: UpdateMemberRoleDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.membersService.updateRole(
      userId,
      workspaceId,
      dto,
      user.role as WorkspaceRole,
    );
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async remove(
    @Param('userId') userId: string,
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.membersService.remove(
      userId,
      workspaceId,
      user.sub,
      user.role as WorkspaceRole,
    );
  }
}

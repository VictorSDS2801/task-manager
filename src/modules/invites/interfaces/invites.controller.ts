import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../shared/guards/roles.guard';
import { CurrentWorkspace } from '../../../shared/decorators/current-workspace.decorator';
import { InvitesService } from '../domain/invites.service';
import { CreateInviteDto } from '../application/dto/create-invite.dto';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';

@Controller()
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post('workspaces/:workspaceId/invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async create(
    @Body() dto: CreateInviteDto,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.invitesService.create(dto, workspaceId);
  }

  @Get('workspaces/:workspaceId/invites')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(WorkspaceRole.OWNER, WorkspaceRole.ADMIN)
  async findAll(@CurrentWorkspace() workspaceId: string) {
    return this.invitesService.findAll(workspaceId);
  }

  @Get('invites/accept')
  async accept(@Query('token') token: string) {
    return this.invitesService.accept(token);
  }
}

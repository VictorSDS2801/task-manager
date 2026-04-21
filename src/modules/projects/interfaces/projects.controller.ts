import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../../shared/decorators/current-workspace.decorator';
import { ProjectService } from '../domain/project.service';
import { CreateProjectDto } from '../application/dto/create-project.dto';
import { UpdateProjectDto } from '../application/dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.projectService.create(dto, workspaceId);
  }

  @Get()
  async findAll(@CurrentWorkspace() workspaceId: string) {
    return this.projectService.findAll(workspaceId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.projectService.findOne(id, workspaceId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.projectService.update(id, workspaceId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    await this.projectService.delete(id, workspaceId);
  }
}

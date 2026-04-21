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
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { CurrentWorkspace } from '../../../shared/decorators/current-workspace.decorator';
import { TasksService } from '../domain/tasks.service';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';
import { TaskFiltersDto } from '../application/dto/task-filters.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  async create(
    @Body() dto: CreateTaskDto,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.tasksService.create(dto, workspaceId);
  }

  @Get()
  async findAll(
    @CurrentWorkspace() workspaceId: string,
    @Query() filters: TaskFiltersDto,
  ) {
    return this.tasksService.findAll(workspaceId, filters);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.tasksService.findOne(id, workspaceId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.tasksService.update(id, workspaceId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    await this.tasksService.delete(id, workspaceId);
  }

  @Post(':id/subtasks')
  async addSubtask(
    @Param('id') id: string,
    @Body('title') title: string,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.tasksService.addSubtask(id, workspaceId, title);
  }

  @Patch(':id/subtasks/:subtaskId')
  async updateSubtask(
    @Param('id') taskId: string,
    @Param('subtaskId') subtaskId: string,
    @Body('done') done: boolean,
    @CurrentWorkspace() workspaceId: string,
  ) {
    return this.tasksService.updateSubtask(
      taskId,
      subtaskId,
      workspaceId,
      done,
    );
  }
}

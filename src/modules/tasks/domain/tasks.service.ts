import { Injectable, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TaskRepository } from '../infrastructure/task.repository';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { UpdateTaskDto } from '../application/dto/update-task.dto';
import { TaskFiltersDto } from '../application/dto/task-filters.dto';
import { TaskDocument } from './task.schema';
import { EventsGateway } from '../../events/events.gateway';

@Injectable()
export class TasksService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async create(dto: CreateTaskDto, workspaceId: string): Promise<TaskDocument> {
    return this.taskRepository.create({
      ...dto,
      workspaceId: new Types.ObjectId(workspaceId),
      projectId: new Types.ObjectId(dto.projectId),
      assigneeId: dto.assigneeId
        ? new Types.ObjectId(dto.assigneeId)
        : undefined,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
    });
  }

  async findAll(
    workspaceId: string,
    filters: TaskFiltersDto,
  ): Promise<TaskDocument[]> {
    return this.taskRepository.findAll(workspaceId, filters);
  }

  async findOne(id: string, workspaceId: string): Promise<TaskDocument> {
    const task = await this.taskRepository.findOne(id, workspaceId);
    if (!task) {
      throw new NotFoundException('Tarefa não encontrada');
    }
    return task;
  }

  async update(
    id: string,
    workspaceId: string,
    dto: UpdateTaskDto,
  ): Promise<TaskDocument> {
    const data: Record<string, unknown> = { ...dto };
    if (dto.assigneeId) {
      data.assigneeId = new Types.ObjectId(dto.assigneeId);
    }
    const updated = await this.taskRepository.update(id, workspaceId, data);
    if (!updated) {
      throw new NotFoundException('Tarefa não encontrada');
    }
    this.eventsGateway.emitTaskUpdated(workspaceId, updated);
    return updated;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.findOne(id, workspaceId);
    await this.taskRepository.delete(id, workspaceId);
  }

  async addSubtask(
    id: string,
    workspaceId: string,
    title: string,
  ): Promise<TaskDocument> {
    const updated = await this.taskRepository.addSubtask(
      id,
      workspaceId,
      title,
    );
    if (!updated) {
      throw new NotFoundException('Tarefa não encontrada');
    }
    this.eventsGateway.emitTaskUpdated(workspaceId, updated);
    return updated;
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    workspaceId: string,
    done: boolean,
  ): Promise<TaskDocument> {
    const updated = await this.taskRepository.updateSubtask(
      taskId,
      subtaskId,
      workspaceId,
      done,
    );
    if (!updated) {
      throw new NotFoundException('Tarefa ou subtarefa não encontrada');
    }
    this.eventsGateway.emitTaskUpdated(workspaceId, updated);
    return updated;
  }
}

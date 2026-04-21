import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from '../domain/task.schema';
import { TaskFiltersDto } from '../application/dto/task-filters.dto';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectModel(Task.name)
    private readonly model: Model<TaskDocument>,
  ) {}

  async create(data: Partial<Task>): Promise<TaskDocument> {
    return this.model.create(data);
  }

  async findAll(
    workspaceId: string,
    filters: TaskFiltersDto,
  ): Promise<TaskDocument[]> {
    const query: Record<string, unknown> = { workspaceId };

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.projectId) query.projectId = filters.projectId;
    if (filters.assigneeId) query.assigneeId = filters.assigneeId;
    if (filters.label) query.labels = { $in: [filters.label] };

    return this.model.find(query).exec();
  }

  async findOne(id: string, workspaceId: string): Promise<TaskDocument | null> {
    return this.model.findOne({ _id: id, workspaceId }).exec();
  }

  async update(
    id: string,
    workspaceId: string,
    data: Partial<Task>,
  ): Promise<TaskDocument | null> {
    return this.model
      .findOneAndUpdate({ _id: id, workspaceId }, data, { new: true })
      .exec();
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    await this.model.findOneAndDelete({ _id: id, workspaceId }).exec();
  }

  async addSubtask(
    id: string,
    workspaceId: string,
    title: string,
  ): Promise<TaskDocument | null> {
    return this.model
      .findOneAndUpdate(
        { _id: id, workspaceId },
        { $push: { subtasks: { title, done: false } } },
        { new: true },
      )
      .exec();
  }

  async updateSubtask(
    taskId: string,
    subtaskId: string,
    workspaceId: string,
    done: boolean,
  ): Promise<TaskDocument | null> {
    return this.model
      .findOneAndUpdate(
        { _id: taskId, workspaceId, 'subtasks._id': subtaskId },
        { $set: { 'subtasks.$.done': done } },
        { new: true },
      )
      .exec();
  }
}

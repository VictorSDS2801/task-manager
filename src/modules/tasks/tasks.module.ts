import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './domain/task.schema';
import { TaskRepository } from './infrastructure/task.repository';
import { TasksService } from './domain/tasks.service';
import { TasksController } from './interfaces/tasks.controller';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    EventsModule,
  ],
  controllers: [TasksController],
  providers: [TaskRepository, TasksService],
  exports: [TasksService, TaskRepository],
})
export class TasksModule {}

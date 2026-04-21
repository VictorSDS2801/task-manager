import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { TaskPriority, TaskStatus } from '../../domain/task.schema';

export class CreateTaskDto {
  @IsString()
  @MinLength(2, { message: 'Título deve ter no mínimo 2 caracteres' })
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status inválido' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridade inválida' })
  priority?: TaskPriority;

  @IsMongoId({ message: 'projectId inválido' })
  projectId!: string;

  @IsOptional()
  @IsMongoId({ message: 'assigneeId inválido' })
  assigneeId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsDateString({}, { message: 'dueDate inválida' })
  dueDate?: string;
}

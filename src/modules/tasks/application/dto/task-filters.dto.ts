import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { TaskPriority, TaskStatus } from '../../domain/task.schema';

export class TaskFiltersDto {
  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Status inválido' })
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority, { message: 'Prioridade inválida' })
  priority?: TaskPriority;

  @IsOptional()
  @IsMongoId({ message: 'projectId inválido' })
  projectId?: string;

  @IsOptional()
  @IsMongoId({ message: 'assigneeId inválido' })
  assigneeId?: string;

  @IsOptional()
  @IsString()
  label?: string;
}

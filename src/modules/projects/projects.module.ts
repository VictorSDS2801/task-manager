import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Project, ProjectSchema } from './domain/project.schema';
import { ProjectRepository } from './infrastructure/project.repository';
import { ProjectService } from './domain/project.service';
import { ProjectsController } from './interfaces/projects.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Project.name, schema: ProjectSchema }]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectRepository, ProjectService],
  exports: [ProjectService, ProjectRepository],
})
export class ProjectsModule {}

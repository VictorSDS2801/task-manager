import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Workspace, WorkspaceSchema } from './domain/workspace.schema';
import { WorkspaceRepository } from './infrastructure/workspace.repository';
import { WorkspaceService } from './domain/workspace.service';
import { WorkspacesController } from './interfaces/workspaces.controller';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Workspace.name, schema: WorkspaceSchema },
    ]),
    MembersModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspaceRepository, WorkspaceService],
  exports: [WorkspaceService, WorkspaceRepository],
})
export class WorkspacesModule {}

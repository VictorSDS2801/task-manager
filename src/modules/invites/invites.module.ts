import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { Invite, InviteSchema } from './domain/invite.schema';
import { InviteRepository } from './infrastructure/invite.repository';
import { InvitesService } from './domain/invites.service';
import { InvitesController } from './interfaces/invites.controller';
import {
  InviteEmailProcessor,
  INVITE_EMAIL_QUEUE,
} from './infrastructure/invite-email.processor';
import { MailService } from './infrastructure/mail.service';
import { MembersModule } from '../members/members.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Invite.name, schema: InviteSchema }]),
    BullModule.registerQueue({ name: INVITE_EMAIL_QUEUE }),
    MembersModule,
    WorkspacesModule,
  ],
  controllers: [InvitesController],
  providers: [
    InviteRepository,
    InvitesService,
    InviteEmailProcessor,
    MailService,
  ],
  exports: [InvitesService],
})
export class InvitesModule {}

import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { MailService } from './mail.service';

export const INVITE_EMAIL_QUEUE = 'invite-email';

export interface InviteEmailJob {
  to: string;
  token: string;
  workspaceName: string;
}

@Processor(INVITE_EMAIL_QUEUE)
export class InviteEmailProcessor extends WorkerHost {
  private readonly logger = new Logger(InviteEmailProcessor.name);

  constructor(private readonly mailService: MailService) {
    super();
  }

  async process(job: Job<InviteEmailJob>): Promise<void> {
    this.logger.log(
      `Processando job ${job.id} — enviando convite para ${job.data.to}`,
    );
    await this.mailService.sendInviteEmail(
      job.data.to,
      job.data.token,
      job.data.workspaceName,
    );
  }
}

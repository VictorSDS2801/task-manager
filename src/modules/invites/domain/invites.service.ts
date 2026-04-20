import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { InviteRepository } from '../infrastructure/invite.repository';
import { MemberRepository } from '../../members/infrastructure/member.repository';
import { WorkspaceRepository } from '../../workspaces/infrastructure/workspace.repository';
import { CreateInviteDto } from '../application/dto/create-invite.dto';
import { InviteDocument } from './invite.schema';
import { MemberDocument } from '../../members/domain/member.schema';
import { WorkspaceRole } from '../../../shared/types/workspace-role.enum';
import {
  INVITE_EMAIL_QUEUE,
  InviteEmailJob,
} from '../infrastructure/invite-email.processor';

@Injectable()
export class InvitesService {
  constructor(
    private readonly inviteRepository: InviteRepository,
    private readonly memberRepository: MemberRepository,
    private readonly workspaceRepository: WorkspaceRepository,
    @InjectQueue(INVITE_EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  async create(
    dto: CreateInviteDto,
    workspaceId: string,
  ): Promise<InviteDocument> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException('Workspace não encontrado');
    }

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invite = await this.inviteRepository.create({
      email: dto.email,
      token,
      workspaceId: workspace._id,
      role: dto.role ?? WorkspaceRole.MEMBER,
      accepted: false,
      expiresAt,
    });

    const job: InviteEmailJob = {
      to: dto.email,
      token,
      workspaceName: workspace.name,
    };

    await this.emailQueue.add('send-invite', job, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });

    return invite;
  }

  async accept(token: string): Promise<MemberDocument> {
    const invite = await this.inviteRepository.findByToken(token);

    if (!invite) {
      throw new NotFoundException('Convite não encontrado');
    }

    if (invite.accepted) {
      throw new BadRequestException('Convite já foi aceito');
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException('Convite expirado');
    }

    const existing = await this.memberRepository.findOne(
      invite.email,
      invite.workspaceId.toString(),
    );

    if (existing) {
      throw new BadRequestException('Usuário já é membro deste workspace');
    }

    await this.inviteRepository.markAccepted(token);

    return this.memberRepository.create(
      invite.email,
      invite.workspaceId.toString(),
      invite.role,
    );
  }

  async findAll(workspaceId: string): Promise<InviteDocument[]> {
    return this.inviteRepository.findByWorkspace(workspaceId);
  }
}

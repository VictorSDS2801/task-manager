import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_PASS'),
      },
    });
  }

  async sendInviteEmail(
    to: string,
    token: string,
    workspaceName: string,
  ): Promise<void> {
    const link = `http://localhost:3000/api/invites/accept?token=${token}`;

    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM'),
        to,
        subject: `Convite para o workspace ${workspaceName}`,
        html: `
          <h2>Você foi convidado!</h2>
          <p>Clique no link abaixo para aceitar o convite para o workspace <strong>${workspaceName}</strong>:</p>
          <a href="${link}">${link}</a>
          <p>Este link expira em 48 horas.</p>
        `,
      });
      this.logger.log(`E-mail de convite enviado para ${to}`);
    } catch (error) {
      this.logger.error(`Erro ao enviar e-mail para ${to}`, error);
    }
  }
}

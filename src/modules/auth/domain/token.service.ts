import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  generateTokenPair(payload: CurrentUserPayload): TokenPair {
    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.secret'),
      expiresIn: this.config.get<string>('jwt.expiresIn') as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get<string>('jwt.refreshSecret'),
      expiresIn: this.config.get<string>('jwt.refreshExpiresIn') as StringValue,
    });

    return { accessToken, refreshToken };
  }

  verifyRefreshToken(token: string): CurrentUserPayload {
    return this.jwtService.verify<CurrentUserPayload>(token, {
      secret: this.config.get<string>('jwt.refreshSecret'),
    });
  }
}

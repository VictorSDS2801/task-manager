import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import type { CurrentUserPayload } from '../../../shared/decorators/current-user.decorator';
import type { UserDocument } from '../domain/user.schema';
import { AuthService } from '../domain/auth.service';
import { TokenService } from '../domain/token.service';
import { RefreshTokenRepository } from '../infrastructure/refresh-token.repository';
import { RegisterDto } from '../application/dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<{ message: string }> {
    await this.authService.register(dto);
    return { message: 'Usuário criado com sucesso' };
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const user = req.user as UserDocument & { _id: string };

    const payload: CurrentUserPayload = {
      sub: user._id.toString(),
      workspaceId: '',
      role: 'member',
    };

    const { accessToken, refreshToken } =
      this.tokenService.generateTokenPair(payload);

    await this.refreshTokenRepository.save(payload.sub, refreshToken);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const token = req.cookies?.refresh_token as string | undefined;
    if (!token) {
      throw new UnauthorizedException('Refresh token não encontrado');
    }

    const payload = this.tokenService.verifyRefreshToken(token);
    const stored = await this.refreshTokenRepository.find(payload.sub);

    if (!stored || stored !== token) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      this.tokenService.generateTokenPair(payload);

    await this.refreshTokenRepository.save(payload.sub, newRefreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ message: string }> {
    const token = req.cookies?.refresh_token as string | undefined;
    if (token) {
      const payload = this.tokenService.verifyRefreshToken(token);
      await this.refreshTokenRepository.delete(payload.sub);
    }

    res.clearCookie('refresh_token');
    return { message: 'Logout realizado com sucesso' };
  }
}

import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import type { StringValue } from 'ms';
import { User, UserSchema } from './domain/user.schema';
import { AuthService } from './domain/auth.service';
import { TokenService } from './domain/token.service';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { LocalStrategy } from './application/strategies/local.strategy';
import { RefreshTokenRepository } from './infrastructure/refresh-token.repository';
import { AuthController } from './interfaces/auth.controller';
import { MembersModule } from '../members/members.module';

@Module({
  imports: [
    PassportModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret') as string,
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn') as StringValue,
        },
      }),
    }),
    MembersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    LocalStrategy,
    RefreshTokenRepository,
  ],
  exports: [AuthService, TokenService, JwtModule],
})
export class AuthModule {}

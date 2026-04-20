import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Member, MemberSchema } from './domain/member.schema';
import { MemberRepository } from './infrastructure/member.repository';
import { MembersService } from './domain/members.service';
import { MembersController } from './interfaces/members.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Member.name, schema: MemberSchema }]),
  ],
  controllers: [MembersController],
  providers: [MemberRepository, MembersService],
  exports: [MemberRepository, MembersService],
})
export class MembersModule {}

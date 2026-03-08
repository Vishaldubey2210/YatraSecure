import { Module } from '@nestjs/common';
import { JoinRequestsService } from './join-requests.service';
import { JoinRequestsController } from './join-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { MembersModule } from '../members/members.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [PrismaModule, MembersModule, EmailModule],
  controllers: [JoinRequestsController],
  providers: [JoinRequestsService],
})
export class JoinRequestsModule {}
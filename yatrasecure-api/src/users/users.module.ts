import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController], // 👈 Controller add kiya
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

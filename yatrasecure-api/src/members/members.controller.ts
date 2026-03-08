import {
  Controller,
  Get,
  Delete,
  Post,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MembersService } from './members.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('trips/:tripId/members')
export class MembersController {
  constructor(private membersService: MembersService) {}

  @Get()
  async getMembers(@Param('tripId') tripId: string) {
    return this.membersService.getTripMembers(tripId);
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @Param('tripId') tripId: string,
    @Param('userId') userId: string,
    @Req() req: any,
  ) {
    return this.membersService.removeMember(tripId, userId, req.user.sub);
  }

  @Post('leave')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async leaveTrip(@Param('tripId') tripId: string, @Req() req: any) {
    return this.membersService.leaveTrip(tripId, req.user.sub);
  }
}
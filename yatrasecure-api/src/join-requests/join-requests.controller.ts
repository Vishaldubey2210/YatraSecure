import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JoinRequestsService } from './join-requests.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('trips/:tripId/join-requests')
@UseGuards(JwtAuthGuard)
export class JoinRequestsController {
  constructor(private joinRequestsService: JoinRequestsService) {}

  @Post()
  async create(
    @Param('tripId') tripId: string,
    @Body() body: { message?: string },
    @Req() req: any,
  ) {
    return this.joinRequestsService.create(tripId, req.user.sub, body.message);
  }

  @Get()
  async findAll(@Param('tripId') tripId: string, @Req() req: any) {
    return this.joinRequestsService.findAllByTrip(tripId, req.user.sub);
  }

  @Patch(':requestId')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Param('requestId') requestId: string,
    @Body() body: { status: 'accepted' | 'rejected' },
    @Req() req: any,
  ) {
    return this.joinRequestsService.updateStatus(requestId, body.status, req.user.sub);
  }

  @Delete(':requestId')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('requestId') requestId: string, @Req() req: any) {
    return this.joinRequestsService.delete(requestId, req.user.sub);
  }
}
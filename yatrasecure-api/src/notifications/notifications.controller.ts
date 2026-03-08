import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(@Req() req: any, @Query('unreadOnly') unreadOnly?: string) {
    return this.notificationsService.getUserNotifications(
      req.user.sub,
      unreadOnly === 'true',
    );
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationsService.getUnreadCount(req.user.sub);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    await this.notificationsService.markAsRead(id, req.user.sub);
    return { message: 'Notification marked as read' };
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Req() req: any) {
    await this.notificationsService.markAllAsRead(req.user.sub);
    return { message: 'All notifications marked as read' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async deleteNotification(@Param('id') id: string, @Req() req: any) {
    await this.notificationsService.deleteNotification(id, req.user.sub);
    return { message: 'Notification deleted' };
  }

  @Delete('clear-read')
  @HttpCode(HttpStatus.OK)
  async deleteAllRead(@Req() req: any) {
    await this.notificationsService.deleteAllRead(req.user.sub);
    return { message: 'Read notifications cleared' };
  }
}
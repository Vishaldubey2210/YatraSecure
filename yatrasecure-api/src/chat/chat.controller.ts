import { Controller, Get, Post, Param, Body, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

class SendMessageDto {
  content: string;
}

@Controller('trips/:tripId/messages')
export class ChatController {
  constructor(private chatService: ChatService) {}

  // GET /api/trips/:tripId/messages
  @Get()
  @UseGuards(JwtAuthGuard)
  async listMessages(@Request() req, @Param('tripId') tripId: string) {
    // Guard ensures user is authenticated, service checks membership
    return this.chatService.getMessages(tripId);
  }

  // POST /api/trips/:tripId/messages
  @Post()
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @Request() req,
    @Param('tripId') tripId: string,
    @Body() body: SendMessageDto,
  ) {
    const userId = req.user.id;
    const username = req.user.username;
    return this.chatService.sendMessage(tripId, userId, username, body.content);
  }
}

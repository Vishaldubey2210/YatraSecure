import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // GET /api/users/me - Get current logged-in user
  @Get('me')
  @UseGuards(JwtAuthGuard) // 👈 Protected route
  async getCurrentUser(@Request() req) {
    return req.user; // User is attached by JWT strategy
  }

  // PATCH /api/users/me - Update current user profile
  @Patch('me')
  @UseGuards(JwtAuthGuard) // 👈 Protected route
  async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
    const userId = req.user.id;
    return this.usersService.updateProfile(userId, updateProfileDto);
  }
}

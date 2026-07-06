import { Controller, Get, Put, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/users.dto';

@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(':username')
  getProfile(@Param('username') username: string, @Request() req: any) {
    const viewerId = req.headers.authorization ? undefined : undefined;
    return this.users.getProfile(username, req.user?.sub);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/profile')
  updateProfile(@Request() req: any, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me/settings')
  updateSettings(@Request() req: any, @Body() dto: UpdateSettingsDto) {
    return this.users.updateSettings(req.user.sub, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('me')
  deleteAccount(@Request() req: any) {
    return this.users.deleteAccount(req.user.sub);
  }
}

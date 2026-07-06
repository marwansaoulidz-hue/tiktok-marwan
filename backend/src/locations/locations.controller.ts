import { Controller, Get, Post, Put, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocationsService } from './locations.service';

@Controller('locations')
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private locationsService: LocationsService) {}

  @Post()
  async updateLocation(@Request() req, @Body() body: { latitude: number; longitude: number; label?: string }) {
    return this.locationsService.updateLocation(req.user.userId, body);
  }

  @Get('friends')
  async getFriendLocations(@Request() req) {
    return this.locationsService.getFriendLocations(req.user.userId);
  }

  @Put('enable')
  async enableSharing(@Request() req) {
    return this.locationsService.enableLocationSharing(req.user.userId);
  }

  @Put('disable')
  async disableSharing(@Request() req) {
    return this.locationsService.disableLocationSharing(req.user.userId);
  }

  @Delete()
  async deleteLocations(@Request() req) {
    return this.locationsService.deleteOldLocations(req.user.userId);
  }
}

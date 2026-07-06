import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/dto/auth.dto';
import { AdminService } from './admin.service';
import { Role } from '@prisma/client';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Get('videos')
  async getAllVideos() {
    return this.adminService.getAllVideos();
  }

  @Get('reports')
  async getAllReports() {
    return this.adminService.getAllReports();
  }

  @Get('storage')
  async getStorageStats() {
    return this.adminService.getStorageStats();
  }

  @Get('logs')
  async getAdminLogs() {
    return this.adminService.getAdminLogs();
  }

  @Put('users/:userId/role')
  async updateUserRole(@Param('userId') userId: string, @Body() body: { role: Role }) {
    await this.adminService.logAdminAction(
      (Request as any).user?.userId,
      'UPDATE_ROLE',
      userId,
      `New role: ${body.role}`,
    );
    return this.adminService.updateUserRole(userId, body.role);
  }

  @Put('users/:userId/deactivate')
  async deactivateUser(@Param('userId') userId: string, @Request() req) {
    await this.adminService.logAdminAction(req.user.userId, 'DEACTIVATE_USER', userId);
    return this.adminService.deactivateUser(userId);
  }

  @Put('users/:userId/activate')
  async activateUser(@Param('userId') userId: string, @Request() req) {
    await this.adminService.logAdminAction(req.user.userId, 'ACTIVATE_USER', userId);
    return this.adminService.activateUser(userId);
  }

  @Delete('videos/:videoId')
  async deleteVideo(@Param('videoId') videoId: string, @Request() req) {
    await this.adminService.logAdminAction(req.user.userId, 'DELETE_VIDEO', videoId);
    return this.adminService.deleteVideo(videoId);
  }

  @Delete('comments/:commentId')
  async deleteComment(@Param('commentId') commentId: string, @Request() req) {
    await this.adminService.logAdminAction(req.user.userId, 'DELETE_COMMENT', commentId);
    return this.adminService.deleteComment(commentId);
  }
}

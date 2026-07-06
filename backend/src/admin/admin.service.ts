import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getAllUsers() {
    return this.prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: { videos: true, followers: true, following: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllVideos() {
    return this.prisma.video.findMany({
      include: {
        user: { include: { profile: true } },
        _count: { select: { likes: true, comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAllReports() {
    return this.prisma.report.findMany({
      include: {
        reporter: { include: { profile: true } },
        video: { include: { user: { include: { profile: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: Role) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      include: { profile: true },
    });
  }

  async deactivateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      include: { profile: true },
    });
  }

  async activateUser(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: true },
      include: { profile: true },
    });
  }

  async deleteVideo(videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Vidéo introuvable');

    await this.prisma.video.delete({ where: { id: videoId } });
    return { message: 'Vidéo supprimée' };
  }

  async deleteComment(commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Commentaire introuvable');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Commentaire supprimé' };
  }

  async getStorageStats() {
    const stats = await this.prisma.storageStats.findUnique({ where: { id: 'global' } });
    const videoCount = await this.prisma.video.count();
    const userCount = await this.prisma.user.count();

    return {
      videoBytes: stats?.videoBytes?.toString() || '0',
      videoCount,
      userCount,
      videoLimitGb: process.env.VIDEO_STORAGE_LIMIT_GB || '150',
    };
  }

  async logAdminAction(adminId: string, action: string, target?: string, details?: string) {
    await this.prisma.adminLog.create({
      data: {
        adminId,
        action,
        target,
        details,
      },
    });
  }

  async getAdminLogs(limit = 50) {
    return this.prisma.adminLog.findMany({
      include: { admin: { include: { profile: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

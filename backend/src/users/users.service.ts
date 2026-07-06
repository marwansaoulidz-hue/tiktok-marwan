import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto, UpdateSettingsDto } from './dto/users.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(username: string, viewerId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        profile: true,
        videos: {
          where: { status: 'READY' },
          orderBy: { createdAt: 'desc' },
          include: { hashtags: { include: { hashtag: true } }, _count: { select: { likes: true, comments: true } } },
        },
        _count: { select: { followers: true, following: true } },
      },
    });
    if (!user || !user.isActive) throw new NotFoundException('Utilisateur introuvable');

    let isFollowing = false;
    if (viewerId && viewerId !== user.id) {
      const follow = await this.prisma.follow.findUnique({
        where: { followerId_followingId: { followerId: viewerId, followingId: user.id } },
      });
      isFollowing = !!follow;
    }

    const { passwordHash, ...safe } = user;
    return { ...safe, isFollowing, isOwnProfile: viewerId === user.id };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { userId },
      data: dto,
    });
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    if (dto.password) {
      const hash = await argon2.hash(dto.password);
      await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: hash } });
    }
    if (dto.email) {
      await this.prisma.user.update({ where: { id: userId }, data: { email: dto.email } });
    }
    const profileData: any = {};
    if (dto.isPrivate !== undefined) profileData.isPrivate = dto.isPrivate;
    if (dto.shareLocation !== undefined) profileData.shareLocation = dto.shareLocation;
    if (dto.notifyMessages !== undefined) profileData.notifyMessages = dto.notifyMessages;
    if (dto.notifyLikes !== undefined) profileData.notifyLikes = dto.notifyLikes;
    if (Object.keys(profileData).length) {
      await this.prisma.profile.update({ where: { userId }, data: profileData });
    }
    return { ok: true };
  }

  async deleteAccount(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { ok: true };
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
    const avatarUrl = `/api/users/avatar/${userId}/${Date.now()}.jpg`;
    await this.prisma.profile.update({ where: { userId }, data: { avatarUrl } });
    return { avatarUrl };
  }
}

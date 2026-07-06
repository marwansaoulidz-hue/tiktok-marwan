import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async updateLocation(userId: string, data: { latitude: number; longitude: number; label?: string }) {
    if (!data.latitude || !data.longitude) {
      throw new BadRequestException('Coordonnées invalides');
    }

    if (data.latitude < -90 || data.latitude > 90 || data.longitude < -180 || data.longitude > 180) {
      throw new BadRequestException('Coordonnées hors limites');
    }

    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile?.shareLocation) {
      throw new ForbiddenException('Le partage de position est désactivé');
    }

    const location = await this.prisma.location.create({
      data: {
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        label: data.label,
      },
    });

    return location;
  }

  async getFriendLocations(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });

    const friendIds = friendships.map(f => f.senderId === userId ? f.receiverId : f.senderId);

    const friendsWithLocation = await this.prisma.user.findMany({
      where: {
        id: { in: friendIds },
        profile: { shareLocation: true },
      },
      include: {
        profile: true,
        locations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return friendsWithLocation.map(user => ({
      id: user.id,
      username: user.username,
      displayName: user.profile?.displayName,
      avatar: user.profile?.avatarUrl,
      location: user.locations[0] || null,
    }));
  }

  async enableLocationSharing(userId: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { shareLocation: true },
    });
  }

  async disableLocationSharing(userId: string) {
    return this.prisma.profile.update({
      where: { userId },
      data: { shareLocation: false },
    });
  }

  async deleteOldLocations(userId: string) {
    await this.prisma.location.deleteMany({
      where: { userId },
    });
  }
}

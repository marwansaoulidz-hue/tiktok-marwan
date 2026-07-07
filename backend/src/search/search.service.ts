import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async search(q: string) {
    const query = q.trim();
    if (!query) return { users: [], videos: [], hashtags: [] };

    const [users, videos, hashtags] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          isActive: true,
          OR: [
            { username: { contains: query } },
            { profile: { displayName: { contains: query } } },
          ],
        },
        take: 20,
        include: { profile: true, _count: { select: { followers: true } } },
      }),
      this.prisma.video.findMany({
        where: {
          status: 'READY',
          visibility: 'PUBLIC',
          title: { contains: query },
        },
        take: 20,
        include: { user: { include: { profile: true } }, _count: { select: { likes: true } } },
      }),
      this.prisma.hashtag.findMany({
        where: { name: { contains: query.toLowerCase() } },
        take: 20,
        include: { _count: { select: { videos: true } } },
      }),
    ]);

    return { users, videos, hashtags };
  }

  async searchByHashtag(name: string) {
    const hashtag = await this.prisma.hashtag.findUnique({
      where: { name: name.toLowerCase() },
      include: {
        videos: {
          include: {
            video: {
              include: { user: { include: { profile: true } }, _count: { select: { likes: true, comments: true } } },
            },
          },
        },
      },
    });
    if (!hashtag) return { hashtag: name, videos: [] };
    return {
      hashtag: hashtag.name,
      videos: hashtag.videos.map(vh => vh.video).filter(v => v.status === 'READY'),
    };
  }
}

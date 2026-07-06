import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { QueueService } from '../queue/queue.service';
import { config, videoStorageLimitBytes } from '../config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class VideosService {
  private uploadDir = '/tmp/uploads';

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private queue: QueueService,
  ) {
    if (!fs.existsSync(this.uploadDir)) fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async upload(userId: string, file: Express.Multer.File, body: { title: string; description?: string; hashtags?: string; visibility?: string }) {
    const count = await this.prisma.video.count({ where: { userId } });
    if (count >= config.maxVideosPerUser) {
      throw new BadRequestException(`Limite de ${config.maxVideosPerUser} vidéos atteinte`);
    }

    const stats = await this.prisma.storageStats.findUnique({ where: { id: 'global' } });
    const used = stats?.videoBytes ?? BigInt(0);
    if (used >= videoStorageLimitBytes()) {
      throw new BadRequestException('Quota de stockage vidéo atteint (150 Go)');
    }

    const maxBytes = config.maxUploadSizeMb * 1024 * 1024;
    if (file.size > maxBytes) {
      throw new BadRequestException(`Fichier trop volumineux (max ${config.maxUploadSizeMb} Mo)`);
    }

    const video = await this.prisma.video.create({
      data: {
        userId,
        title: body.title,
        description: body.description,
        visibility: (body.visibility as any) || 'PUBLIC',
        status: 'PENDING',
      },
    });

    const inputPath = path.join(this.uploadDir, `${video.id}${path.extname(file.originalname)}`);
    fs.writeFileSync(inputPath, file.buffer);

    const tags = this.parseHashtags(body.hashtags || '');
    for (const name of tags) {
      const hashtag = await this.prisma.hashtag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
      await this.prisma.videoHashtag.create({ data: { videoId: video.id, hashtagId: hashtag.id } });
    }

    await this.queue.addVideoJob(video.id, inputPath);
    return video;
  }

  async getFeed(userId: string | null, cursor?: string, limit = 10) {
    const following = userId
      ? (await this.prisma.follow.findMany({ where: { followerId: userId }, select: { followingId: true } })).map(f => f.followingId)
      : [];

    const videos = await this.prisma.video.findMany({
      where: {
        status: 'READY',
        visibility: userId ? { in: ['PUBLIC', ...(following.length ? ['FRIENDS' as const] : [])] } : 'PUBLIC',
        ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
      },
      orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        user: { include: { profile: true } },
        hashtags: { include: { hashtag: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });

    let likedIds: string[] = [];
    if (userId) {
      const likes = await this.prisma.like.findMany({
        where: { userId, videoId: { in: videos.map(v => v.id) } },
        select: { videoId: true },
      });
      likedIds = likes.map(l => l.videoId);
    }

    const nextCursor = videos.length === limit ? videos[videos.length - 1].createdAt.toISOString() : null;
    return {
      videos: await Promise.all(videos.map(async v => this.formatVideo(v, likedIds.includes(v.id)))),
      nextCursor,
    };
  }

  async getVideo(id: string, userId?: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        user: { include: { profile: true } },
        hashtags: { include: { hashtag: true } },
        _count: { select: { likes: true, comments: true } },
      },
    });
    if (!video || video.status !== 'READY') throw new NotFoundException('Vidéo introuvable');

    await this.prisma.video.update({ where: { id }, data: { viewCount: { increment: 1 } } });

    let liked = false;
    if (userId) {
      liked = !!(await this.prisma.like.findUnique({ where: { userId_videoId: { userId, videoId: id } } }));
    }

    return this.formatVideo(video, liked);
  }

  async getStreamUrl(id: string) {
    const video = await this.prisma.video.findUnique({ where: { id } });
    if (!video?.objectKey) throw new NotFoundException('Vidéo non disponible');
    const url = await this.storage.getPresignedUrl(video.objectKey, 3600);
    return { url };
  }

  private parseHashtags(raw: string): string[] {
    return [...new Set(
      raw.split(/[\s,#]+/)
        .map(t => t.replace(/^#/, '').toLowerCase().trim())
        .filter(t => t.length > 0 && t.length <= 50),
    )].slice(0, 10);
  }

  private async formatVideo(video: any, liked: boolean) {
    let videoUrl = null;
    let thumbnailUrl = null;
    if (video.objectKey) videoUrl = await this.storage.getPresignedUrl(video.objectKey, 3600);
    if (video.thumbnailKey) thumbnailUrl = await this.storage.getPresignedUrl(video.thumbnailKey, 3600);

    return {
      ...video,
      sizeBytes: video.sizeBytes?.toString(),
      videoUrl,
      thumbnailUrl,
      liked,
      likeCount: video._count?.likes ?? 0,
      commentCount: video._count?.comments ?? 0,
    };
  }
}

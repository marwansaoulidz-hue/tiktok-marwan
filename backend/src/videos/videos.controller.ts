import {
  Controller, Get, Post, Param, Query, UseGuards, Request, UseInterceptors, UploadedFile, Body, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideosService } from './videos.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { memoryStorage } from 'multer';

@Controller('videos')
export class VideosController {
  constructor(private videos: VideosService) {}

  @Get('feed')
  feed(@Query('cursor') cursor: string, @Request() req: any) {
    const userId = this.extractUserId(req);
    return this.videos.getFeed(userId, cursor);
  }

  @Get(':id/stream')
  stream(@Param('id') id: string) {
    return this.videos.getStreamUrl(id);
  }

  @Get(':id')
  getVideo(@Param('id') id: string, @Request() req: any) {
    return this.videos.getVideo(id, this.extractUserId(req) ?? undefined);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('video', {
    storage: memoryStorage(),
    limits: { fileSize: 110 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
      cb(null, allowed.includes(file.mimetype));
    },
  }))
  upload(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { title: string; description?: string; hashtags?: string; visibility?: string },
  ) {
    if (!file) throw new BadRequestException('Fichier vidéo requis');
    if (!body.title?.trim()) throw new BadRequestException('Titre requis');
    return this.videos.upload(req.user.sub, file, body);
  }

  private extractUserId(req: any): string | null {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return null;
    try {
      const payload = JSON.parse(Buffer.from(auth.split('.')[1], 'base64').toString());
      return payload.sub;
    } catch {
      return null;
    }
  }
}
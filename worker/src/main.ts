import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import * as Minio from 'minio';
import * as ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();
const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000', 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
  secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
});

const bucket = process.env.MINIO_BUCKET || 'videos';
const maxDurationSec = parseInt(process.env.MAX_VIDEO_DURATION_SEC || '45', 10);

const worker = new Worker(
  'video-transcode',
  async (job: Job) => {
    const { videoId, inputPath } = job.data;
    console.log(`Processing video ${videoId}`);

    try {
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'PROCESSING' },
      });

      const outputPath = path.join('/tmp/uploads', `${videoId}_converted.mp4`);
      const thumbnailPath = path.join('/tmp/uploads', `${videoId}_thumb.jpg`);

      // Get video duration
      const duration = await getVideoDuration(inputPath);
      if (duration > maxDurationSec) {
        throw new Error(`Video duration ${duration}s exceeds limit of ${maxDurationSec}s`);
      }

      // Transcode video
      await transcodeVideo(inputPath, outputPath);

      // Generate thumbnail
      await generateThumbnail(inputPath, thumbnailPath);

      // Upload to MinIO
      const videoKey = `videos/${videoId}.mp4`;
      const thumbnailKey = `thumbnails/${videoId}.jpg`;

      await minioClient.fPutObject(bucket, videoKey, outputPath, {
        'Content-Type': 'video/mp4',
      });

      await minioClient.fPutObject(bucket, thumbnailKey, thumbnailPath, {
        'Content-Type': 'image/jpeg',
      });

      // Get file size
      const stats = fs.statSync(outputPath);
      const sizeBytes = BigInt(stats.size);

      // Update database
      await prisma.video.update({
        where: { id: videoId },
        data: {
          status: 'READY',
          objectKey: videoKey,
          thumbnailKey: thumbnailKey,
          durationSec: duration,
          sizeBytes: sizeBytes,
        },
      });

      // Update storage stats
      const currentStats = await prisma.storageStats.findUnique({ where: { id: 'global' } });
      await prisma.storageStats.update({
        where: { id: 'global' },
        data: {
          videoBytes: (currentStats?.videoBytes || BigInt(0)) + sizeBytes,
        },
      });

      // Cleanup
      fs.unlinkSync(inputPath);
      fs.unlinkSync(outputPath);
      fs.unlinkSync(thumbnailPath);

      console.log(`Video ${videoId} processed successfully`);
    } catch (error) {
      console.error(`Error processing video ${videoId}:`, error);
      await prisma.video.update({
        where: { id: videoId },
        data: { status: 'FAILED' },
      });
      throw error;
    }
  },
  { connection },
);

function getVideoDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
    });
  });
}

function transcodeVideo(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .output(outputPath)
      .videoCodec('libx264')
      .audioCodec('aac')
      .size('1080x?')
      .aspect('9:16')
      .videoBitrate('5000k')
      .audioBitrate('128k')
      .outputOptions([
        '-movflags +faststart',
        '-tune fastdecode',
        '-preset fast',
      ])
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

function generateThumbnail(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .screenshots({
        timestamps: ['50%'],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: '320x?',
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
}

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
});

process.on('SIGTERM', async () => {
  await worker.close();
  await prisma.$disconnect();
  await connection.quit();
  process.exit(0);
});

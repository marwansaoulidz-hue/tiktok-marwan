import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService implements OnModuleDestroy {
  public videoQueue: Queue;

  constructor() {
    const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
    this.videoQueue = new Queue('video-transcode', {
      connection: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port || '6379', 10),
        maxRetriesPerRequest: null,
      },
    });
  }

  async addVideoJob(videoId: string, inputPath: string) {
    await this.videoQueue.add('transcode', { videoId, inputPath }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async onModuleDestroy() {
    await this.videoQueue.close();
  }
}
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private connection: IORedis;
  public videoQueue: Queue;

  constructor() {
    this.connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: null,
    });
    this.videoQueue = new Queue('video-transcode', { connection: this.connection });
  }

  async addVideoJob(videoId: string, inputPath: string) {
    await this.videoQueue.add('transcode', { videoId, inputPath }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
    });
  }

  async onModuleDestroy() {
    await this.videoQueue.close();
    await this.connection.quit();
  }
}

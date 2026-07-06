import { Injectable } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class StorageService {
  private client: Minio.Client;
  private bucket: string;

  constructor() {
    this.bucket = process.env.MINIO_BUCKET || 'videos';
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000', 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ROOT_USER || 'minioadmin',
      secretKey: process.env.MINIO_ROOT_PASSWORD || 'minioadmin',
    });
  }

  async uploadFile(key: string, filePath: string, contentType: string) {
    await this.client.fPutObject(this.bucket, key, filePath, { 'Content-Type': contentType });
  }

  async uploadBuffer(key: string, buffer: Buffer, contentType: string) {
    await this.client.putObject(this.bucket, key, buffer, buffer.length, { 'Content-Type': contentType });
  }

  async getPresignedUrl(key: string, expiry = 3600) {
    return this.client.presignedGetObject(this.bucket, key, expiry);
  }

  async deleteObject(key: string) {
    await this.client.removeObject(this.bucket, key);
  }

  getPublicUrl(key: string) {
    const endpoint = process.env.MINIO_PUBLIC_ENDPOINT || process.env.DOMAIN || 'localhost';
    const port = process.env.MINIO_PUBLIC_PORT || '';
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    const portPart = port ? `:${port}` : '';
    return `${protocol}://${endpoint}${portPart}/${this.bucket}/${key}`;
  }
}

import { Injectable } from '@nestjs/common';
import { Client } from 'minio';
import * as process from 'process';

@Injectable()
export class MinioService {
  private readonly client: Client;
  private readonly bucket: string;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT as string,
      port: parseInt(process.env.MINIO_PORT as string, 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });

    this.bucket = process.env.MINIO_BUCKET as string;

    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.client.bucketExists(this.bucket);
    if (!exists) {
      await this.client.makeBucket(this.bucket, 'us-east-1');
      console.log(`Bucket ${this.bucket} creado`);
    }
  }

  async uploadFile(objectName: string, buffer: Buffer) {
    await this.client.putObject(this.bucket, objectName, buffer);
    return { bucket: this.bucket, objectName };
  }

  async getFileUrl(objectName: string) {
    return this.client.presignedGetObject(this.bucket, objectName, 60 * 10);
  }
}

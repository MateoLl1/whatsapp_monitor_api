import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'minio';
import * as process from 'process';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly client: Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor() {
    this.client = new Client({
      endPoint: process.env.MINIO_ENDPOINT as string,
      port: parseInt(process.env.MINIO_PORT as string, 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY as string,
      secretKey: process.env.MINIO_SECRET_KEY as string,
    });

    this.bucket = process.env.MINIO_BUCKET as string;

    this.publicBaseUrl =
      process.env.API_PUBLIC_BASE_URL ??
      `http://localhost:${process.env.APP_PORT}`;
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  private async ensureBucket() {
    try {
      const exists = await this.client.bucketExists(this.bucket);
      if (!exists) {
        await this.client.makeBucket(this.bucket, 'us-east-1');
      }
    } catch (e: any) {
      if (e.code !== 'BucketAlreadyOwnedByYou') {
        throw e;
      }
    }
  }

  async uploadFile(objectName: string, buffer: Buffer) {
    await this.client.putObject(this.bucket, objectName, buffer);

    return {
      objectName,
      url: `${this.publicBaseUrl}/files/${objectName}`,
    };
  }

  async getObject(objectName: string) {
    return this.client.getObject(this.bucket, objectName);
  }

  getPublicFileUrl(objectName: string) {
    return `${this.publicBaseUrl}/files/${objectName}`;
  }
}

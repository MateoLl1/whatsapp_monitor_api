import { Controller, Post, Get, UploadedFile, UseInterceptors, Param } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';

@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any) {
    return this.minioService.uploadFile(file.originalname, file.buffer);
  }

  @Get(':name')
  async getFile(@Param('name') name: string) {
    return this.minioService.getFileUrl(name);
  }
}

import { Controller, Post, Get, UploadedFile, UseInterceptors, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import type { Response } from 'express';


@Controller('files')
export class FilesController {
  constructor(private readonly minioService: MinioService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: any) {
    return this.minioService.uploadFile(file.originalname, file.buffer);
  }

  @Get(':name')
  async getFile(@Param('name') name: string, @Res() res: Response) {
    const stream = await this.minioService.getObject(name);
    stream.pipe(res);
  }
}

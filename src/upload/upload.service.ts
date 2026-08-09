import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { mkdir, unlink } from 'fs/promises';
import path from 'path';

@Injectable()
export class UploadService {
  async uploadImage(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Image is required');
    }

    const uploadDir = path.join(process.cwd(), 'uploads');

    await mkdir(uploadDir, {
      recursive: true,
    });

    const originalName = path.parse(file.originalname).name
      .trim()
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .toLowerCase() || 'file';
    const shortUuid = randomUUID().replace(/-/g, '').slice(0, 6);
    const filename = `${originalName}-${shortUuid}.webp`;
    const outputPath = path.join(uploadDir, filename);

    await sharp(file.buffer)
      .resize({
        width: 1600,
        height: 1600,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
      })
      .toFile(outputPath);

    return {
      message: 'Image uploaded successfully',
      filename,
      url: `/uploads/${filename}`,
    };
  }

  async uploadImages(files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('Images are required');
    }

    const images = await Promise.all(
      files.map((file) => this.uploadImage(file)),
    );

    return {
      message: 'Images uploaded successfully',
      images,
    };
  }

  async deleteImage(imageUrl: string): Promise<void> {
    const filename = path.basename(imageUrl);
    const imagePath = path.join(process.cwd(), 'uploads', filename);

    try {
      await unlink(imagePath);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

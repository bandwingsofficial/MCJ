import { Logger } from '@nestjs/common';
import sharp from 'sharp';

import type { UploadConfig } from '../../uploads.config';
import type {
  ImageProcessor,
  ProcessedImage,
} from '../../application/ports/image-processor.port';

export class SharpImageProcessor implements ImageProcessor {
  private readonly logger = new Logger(
    SharpImageProcessor.name,
  );

  constructor(private readonly config: UploadConfig) {}

  async optimize(input: Buffer): Promise<ProcessedImage> {
    const startedAt = Date.now();

    const metadata = await sharp(input, {
      failOn: 'none',
    })
      .rotate()
      .metadata();

    const output = sharp(input, {
      failOn: 'none',
    })
      .rotate()
      .resize(
        metadata.width &&
          metadata.width > this.config.maxImageWidth
          ? {
              width: this.config.maxImageWidth,
              withoutEnlargement: true,
            }
          : undefined,
      )
      .webp({
        quality: this.config.webpQuality,
      });

    const buffer = await output.toBuffer();
    const outputMetadata = await output.metadata();

    this.logger.log(
      `Image optimized in ${Date.now() - startedAt}ms (${input.length} -> ${buffer.length} bytes)`,
    );

    return {
      buffer,
      mimeType: 'image/webp',
      extension: 'webp',
      storedName: 'optimized.webp',
      size: buffer.length,
      width: outputMetadata.width ?? metadata.width ?? null,
      height: outputMetadata.height ?? metadata.height ?? null,
    };
  }
}

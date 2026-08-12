import { UploadDomainService } from '../../domain/services/upload-domain.service';
import { AwsS3Service } from '../../infrastructure/aws/aws-s3.service';
import type { UploadConfig } from '../../uploads.config';

import { GetSignedUrlQuery } from './get-signed-url.query';
import { GetSignedUrlResult } from './get-signed-url.result';

export class GetSignedUrlHandler {
  constructor(
    private readonly uploadDomainService: UploadDomainService,
    private readonly awsS3: AwsS3Service,
    private readonly config: UploadConfig,
  ) {}

  async execute(
    query: GetSignedUrlQuery,
  ): Promise<GetSignedUrlResult> {
    const upload = await this.uploadDomainService.ensureActive(
      query.id,
    );

    const expiresInSeconds =
      query.expiresInSeconds ??
      this.config.signedUrlExpirySeconds;

    const signedUrl = await this.awsS3.getSignedUrl(
      upload.objectKey.getValue(),
      expiresInSeconds,
    );

    return new GetSignedUrlResult(
      upload.id,
      upload.objectKey.getValue(),
      signedUrl,
      expiresInSeconds,
    );
  }
}

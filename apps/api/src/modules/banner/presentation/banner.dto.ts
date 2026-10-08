import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  Max,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BANNER_MAX_IMAGES_PER_GROUP } from '@mcj/shared-constants';

const HTTP_URL_OPTIONS = {
  require_protocol: true,
  require_valid_protocol: true,
  protocols: ['http', 'https'],
  require_tld: true,
};

const emptyStringToNull = ({ value }: { value: unknown }) => {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

export class BannerImageDto {
  @IsOptional()
  @IsUUID()
  id?: string;

  @IsUUID()
  uploadId!: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  displayOrder?: number;

  @Transform(emptyStringToNull)
  @IsOptional()
  @IsUrl(HTTP_URL_OPTIONS)
  @MaxLength(2048)
  link?: string | null;
}

export class UpsertBannerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  name!: string;

  @IsIn(['HOMEPAGE'])
  type!: 'HOMEPAGE';

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(BANNER_MAX_IMAGES_PER_GROUP)
  @ValidateNested({ each: true })
  @Type(() => BannerImageDto)
  images!: BannerImageDto[];
}

export class ReplaceBannerImageDto {
  @IsUUID()
  uploadId!: string;
}

export class UpdateBannerStatusDto {
  @IsIn(['ACTIVE', 'INACTIVE'])
  status!: 'ACTIVE' | 'INACTIVE';
}

export class ListBannersQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @IsIn(['HOMEPAGE'])
  type?: 'HOMEPAGE';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number;
}

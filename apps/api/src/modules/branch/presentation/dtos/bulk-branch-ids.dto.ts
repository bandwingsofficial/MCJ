import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BulkBranchIdsDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  branchIds!: string[];
}
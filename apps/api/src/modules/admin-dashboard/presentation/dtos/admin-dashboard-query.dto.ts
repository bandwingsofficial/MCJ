import { IsIn, IsOptional, IsString, Matches } from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class AdminDashboardQueryDto {
  @IsOptional()
  @IsIn([
    'TODAY',
    'THIS_WEEK',
    'THIS_MONTH',
    'THIS_YEAR',
    'ALL_TIME',
    'CUSTOM',
  ])
  preset?: string;

  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}

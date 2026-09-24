import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ArrayMinSize,
  ValidateNested,
  ValidateIf,
} from 'class-validator';
import {
  AssessmentType,
  AttendanceStatus,
  CourseMode,
  EnrollmentStatus,
  InterviewMode,
  InterviewResult,
  InterviewRoundStatus,
  InterviewStatus,
  JobApplicationStatus,
} from '@prisma/client';

import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

export class RecordAttendanceDto {
  @IsUUID()
  batchId!: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;

  @IsUUID()
  studentId!: string;

  @IsDateString()
  date!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsDateString()
  punchIn?: string;

  @IsOptional()
  @IsDateString()
  punchOut?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class BulkAttendanceRecordDto {
  @IsUUID()
  studentId!: string;

  @IsEnum(AttendanceStatus)
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class BulkRecordAttendanceDto {
  @IsUUID()
  batchId!: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;

  @IsDateString()
  date!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BulkAttendanceRecordDto)
  records!: BulkAttendanceRecordDto[];
}

export class AttendanceSheetQueryDto {
  @IsUUID()
  batchId!: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;

  @IsDateString()
  date!: string;
}

export enum PunchType {
  IN = 'IN',
  OUT = 'OUT',
}

export class PunchAttendanceDto {
  @IsUUID()
  batchId!: string;

  @IsUUID()
  batchCourseId!: string;

  @IsUUID()
  studentId!: string;

  @IsEnum(PunchType)
  type!: PunchType;

  @IsOptional()
  @IsDateString()
  date?: string;
}

export class AttendanceQueryDto {
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;

  @IsOptional()
  @IsEnum(CourseMode)
  mode?: CourseMode;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  requireBatchTiming?: boolean;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  take?: number;
}

/** Filters for Batch Manage → student attendance detail. */
export class StudentBatchAttendanceQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsEnum(AttendanceStatus)
  status?: AttendanceStatus;
}

export class CreateAssessmentDto {
  @IsUUID()
  batchId!: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsUUID()
  studentId!: string;

  @IsEnum(AssessmentType)
  type!: AssessmentType;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.01)
  maxMarks!: number;

  @IsNumber()
  @Min(0)
  obtainedMarks!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class UpdateAssessmentDto {
  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxMarks?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  obtainedMarks?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class AssessmentQueryDto {
  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  facultyId?: string;

  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  take?: number;
}

class AssessmentMarkEntryDto {
  @IsUUID()
  studentId!: string;

  @IsNumber()
  @Min(0)
  obtainedMarks!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remarks?: string;
}

export class BulkCreateAssessmentDto {
  @IsUUID()
  batchId!: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;

  @IsEnum(AssessmentType)
  type!: AssessmentType;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.01)
  maxMarks!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AssessmentMarkEntryDto)
  records!: AssessmentMarkEntryDto[];
}

export class BulkUpdateAssessmentGroupDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEnum(AssessmentType)
  type?: AssessmentType;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxMarks?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssessmentMarkEntryDto)
  records?: AssessmentMarkEntryDto[];
}

export class AssessmentSheetQueryDto {
  @IsUUID()
  batchId!: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;
}

export class CreateInterviewRoundDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsInt()
  @Min(1)
  sortOrder!: number;

  @IsOptional()
  @IsEnum(InterviewRoundStatus)
  status?: InterviewRoundStatus;
}

export class UpdateInterviewRoundDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;

  @IsOptional()
  @IsEnum(InterviewRoundStatus)
  status?: InterviewRoundStatus;
}

export class ScheduleInterviewDto {
  @IsUUID()
  applicationId!: string;

  @IsDateString()
  scheduledAt!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @IsEnum(InterviewMode)
  mode!: InterviewMode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationOrLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsUUID()
  interviewerId?: string;

  /** Prefer this over roundNumber when scheduling against configured rounds. */
  @IsOptional()
  @IsUUID()
  roundId?: string;

  /** Legacy fallback when roundId is omitted and assignment already has a round. */
  @IsOptional()
  @IsInt()
  @Min(1)
  roundNumber?: number;
}

export class UpdateInterviewDto {
  @IsOptional()
  @IsDateString()
  scheduledAt?: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @IsOptional()
  @IsEnum(InterviewMode)
  mode?: InterviewMode;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  locationOrLink?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  evaluation?: string;

  @IsOptional()
  @IsEnum(InterviewStatus)
  status?: InterviewStatus;

  @IsOptional()
  @IsEnum(JobApplicationStatus)
  decision?: JobApplicationStatus;

  @IsOptional()
  @IsUUID()
  roundId?: string;

  @IsOptional()
  @IsEnum(InterviewResult)
  result?: InterviewResult;

  @IsOptional()
  @IsInt()
  @Min(1)
  roundNumber?: number;
}

export class CompleteInterviewScheduleNextDto {
  @IsDateString()
  scheduledAt!: string;

  @IsEnum(InterviewMode)
  mode!: InterviewMode;

  @IsString()
  @MaxLength(500)
  locationOrLink!: string;

  @IsUUID()
  interviewerId!: string;

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class CompleteInterviewDto {
  @IsEnum(InterviewResult)
  result!: InterviewResult;

  @IsOptional()
  @IsUUID()
  nextRoundId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(4000)
  evaluation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  /** Required when result is SELECTED_FOR_NEXT_ROUND — schedules next interview atomically. */
  @IsOptional()
  @ValidateNested()
  @Type(() => CompleteInterviewScheduleNextDto)
  scheduleNext?: CompleteInterviewScheduleNextDto;
}

export class ScheduleNextRoundDto {
  @IsUUID()
  applicationId!: string;

  @IsUUID()
  roundId!: string;

  @IsOptional()
  @IsUUID()
  interviewerId?: string;
}

export class UpdateApplicationStatusDto {
  @IsEnum(JobApplicationStatus)
  status!: JobApplicationStatus;
}

export class CreateBranchStaffDto {
  @IsOptional()
  @IsUUID()
  trainerId?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((dto: CreateBranchStaffDto) => !dto.trainerId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z .'-]*$/, {
    message: 'Enter a valid first name',
  })
  firstName?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((dto: CreateBranchStaffDto) => !dto.trainerId)
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z .'-]*$/, {
    message: 'Enter a valid last name',
  })
  lastName?: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf((dto: CreateBranchStaffDto) => !dto.trainerId)
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter a valid 10-digit mobile number',
  })
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  password!: string;

  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsOptional()
  @IsBoolean()
  confirmRestore?: boolean;
}

export class ListBranchStaffQueryDto {
  @IsOptional()
  @IsEnum(BranchUserRole)
  role?: BranchUserRole;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(['ALL', 'ACTIVE', 'INACTIVE'])
  status?: 'ALL' | 'ACTIVE' | 'INACTIVE';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;
}

export class EnrollmentListQueryDto {
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsUUID()
  courseId?: string;

  @IsOptional()
  @IsUUID()
  batchTimingId?: string;

  @IsOptional()
  @IsEnum(EnrollmentStatus)
  status?: EnrollmentStatus;

  /** Comma-separated enrollment statuses (e.g. ADMITTED,CANCELLED). */
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  statusIn?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;
}

export class StudentFeesQueryDto {
  @IsOptional()
  @IsUUID()
  enrollmentId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  take?: number = 10;
}

export class FacultyDashboardQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsUUID()
  batchId?: string;

  @IsOptional()
  @IsUUID()
  batchCourseId?: string;

  @IsOptional()
  @IsEnum(AssessmentType)
  assessmentType?: AssessmentType;
}

export class UpdateBranchStaffDto {
  @IsOptional()
  @IsUUID()
  trainerId?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z .'-]*$/, {
    message: 'Enter a valid first name',
  })
  firstName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  @Matches(/^[A-Za-z][A-Za-z .'-]*$/, {
    message: 'Enter a valid last name',
  })
  lastName?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail()
  email?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Matches(/^[6-9]\d{9}$/, {
    message: 'Enter a valid 10-digit mobile number',
  })
  phone?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  role?: string;
}

export class ResetBranchStaffPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/, {
    message:
      'Password must contain uppercase, lowercase, number and special character',
  })
  newPassword!: string;
}

export class AssignFacultyDto {
  @IsUUID()
  facultyId!: string;
}

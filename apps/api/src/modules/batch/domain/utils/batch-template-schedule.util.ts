import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';
import { CourseMode } from '@modules/course/domain/enums/course-mode.enum';
import { DayOfWeek } from '../../domain/enums/day-of-week.enum';

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

const FLEXIBLE_DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
];

export function parseTimeToMinutes(value: string): number {
  const match = TIME_PATTERN.exec(value.trim());
  if (!match) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Time must be in HH:mm format',
      400,
    );
  }
  return Number(match[1]) * 60 + Number(match[2]);
}

export function validateBatchTemplateSchedule(params: {
  hasFixedTime: boolean;
  mode: CourseMode;
  daysOfWeek: DayOfWeek[];
  startTime: string | null | undefined;
  endTime: string | null | undefined;
}): {
  hasFixedTime: boolean;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
} {
  if (!params.hasFixedTime) {
    return {
      hasFixedTime: false,
      daysOfWeek: [],
      startTime: null,
      endTime: null,
    };
  }

  if (!params.daysOfWeek.length) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'At least one batch day is required for fixed schedules',
      400,
    );
  }

  const startTime = params.startTime?.trim() ?? '';
  const endTime = params.endTime?.trim() ?? '';

  if (!startTime || !endTime) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Start time and end time are required for fixed schedules',
      400,
    );
  }

  if (parseTimeToMinutes(endTime) <= parseTimeToMinutes(startTime)) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'End time must be after start time',
      400,
    );
  }

  return {
    hasFixedTime: true,
    daysOfWeek: params.daysOfWeek,
    startTime,
    endTime,
  };
}

/** Resolve template schedule into Batch-required fields (copy-on-create). */
export function resolveTemplateScheduleForBatch(template: {
  hasFixedTime: boolean;
  daysOfWeek: DayOfWeek[];
  startTime: string | null;
  endTime: string | null;
}): {
  daysOfWeek: DayOfWeek[];
  startTime: string;
  endTime: string;
} {
  if (!template.hasFixedTime) {
    return {
      daysOfWeek: FLEXIBLE_DAYS,
      startTime: '00:00',
      endTime: '23:59',
    };
  }

  return {
    daysOfWeek: template.daysOfWeek,
    startTime: template.startTime!,
    endTime: template.endTime!,
  };
}

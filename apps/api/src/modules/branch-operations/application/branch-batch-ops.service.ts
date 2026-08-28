import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttendanceStatus,
  DayOfWeek,
  EnrollmentStatus,
  Prisma,
} from '@prisma/client';

import type { BranchAuthUser } from '@common/decorators/current-branch-user.decorator';
import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { BranchOperationsAccessService } from './branch-operations-access.service';

const VISIBLE_ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

const DAY_INDEX: Record<DayOfWeek, number> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const TRAINER_SELECT = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  bio: true,
  qualification: true,
  experienceYears: true,
  specialization: true,
  profileImageUrl: true,
} as const;

const COURSE_SELECT = {
  id: true,
  title: true,
  code: true,
  shortDescription: true,
  description: true,
  duration: true,
  durationType: true,
} as const;

@Injectable()
export class BranchBatchOpsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: BranchOperationsAccessService,
  ) {}

  async listBatches(user: BranchAuthUser) {
    const assignedIds = this.access.isFaculty(user)
      ? await this.access.getAssignedBatchIds(user)
      : [];

    const batches = await this.prisma.batch.findMany({
      where: this.access.facultyBatchFilter(user, assignedIds),
      include: this.batchListInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return batches.map((batch) => this.toBatchDto(batch));
  }

  async getBatch(user: BranchAuthUser, batchId: string) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false, branchId: user.branchId },
      include: this.batchListInclude(),
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const students = await this.listBatchStudents(user, batchId);

    return {
      ...this.toBatchDto(batch, students.length),
      students,
    };
  }

  async listBatchStudents(user: BranchAuthUser, batchId: string) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        batchId,
        isDeleted: false,
        status: { in: VISIBLE_ENROLLMENT_STATUSES },
        student: { isDeleted: false },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            studentCode: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const studentIds = enrollments.map((item) => item.student.id);
    const attendanceByStudent = new Map<
      string,
      {
        present: number;
        absent: number;
        late: number;
        leave: number;
        total: number;
      }
    >();

    if (studentIds.length) {
      const groups = await this.prisma.attendance.groupBy({
        by: ['studentId', 'status'],
        where: {
          batchId,
          studentId: { in: studentIds },
          branchId: user.branchId,
        },
        _count: { _all: true },
      });

      for (const group of groups) {
        const current = attendanceByStudent.get(group.studentId) ?? {
          present: 0,
          absent: 0,
          late: 0,
          leave: 0,
          total: 0,
        };
        const count = group._count._all;
        current.total += count;
        if (group.status === AttendanceStatus.PRESENT) current.present += count;
        if (group.status === AttendanceStatus.ABSENT) current.absent += count;
        if (group.status === AttendanceStatus.LATE) current.late += count;
        if (group.status === AttendanceStatus.LEAVE) current.leave += count;
        attendanceByStudent.set(group.studentId, current);
      }
    }

    return enrollments.map((item) => {
      const counts = attendanceByStudent.get(item.student.id) ?? {
        present: 0,
        absent: 0,
        late: 0,
        leave: 0,
        total: 0,
      };
      const attended = counts.present + counts.late;

      return {
        id: item.student.id,
        firstName: item.student.firstName,
        lastName: item.student.lastName,
        email: item.student.email,
        phone: item.student.phone,
        studentCode: item.student.studentCode,
        status: item.student.status,
        enrollmentStatus: item.status,
        enrollmentDate:
          item.admissionDate ?? item.joiningDate ?? item.createdAt,
        attendance: {
          ...counts,
          percentage:
            counts.total > 0
              ? Math.round((attended / counts.total) * 100)
              : 0,
        },
      };
    });
  }

  async getBatchCourse(user: BranchAuthUser, batchId: string) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);

    const batch = await this.prisma.batch.findFirst({
      where: { id: batchId, isDeleted: false, branchId: user.branchId },
      include: {
        course: {
          select: COURSE_SELECT,
        },
        trainers: {
          include: { trainer: { select: TRAINER_SELECT } },
        },
        batchCourses: {
          where: { isDeleted: false, isActive: true },
          include: {
            course: { select: COURSE_SELECT },
            trainer: { select: TRAINER_SELECT },
          },
        },
      },
    });

    if (!batch) {
      throw new NotFoundException('Batch not found');
    }

    const courses = this.uniqueCourses([
      batch.course,
      ...batch.batchCourses.map((item) => item.course),
    ]);

    const trainers = this.uniqueTrainers([
      ...batch.trainers.map((item) => item.trainer),
      ...batch.batchCourses.map((item) => item.trainer),
    ]);

    if (!courses.length) {
      return {
        batchId: batch.id,
        courses: [],
        trainers,
        modules: [],
        materials: [],
      };
    }

    const courseIds = courses.map((course) => course.id);

    const [modules, materials] = await Promise.all([
      this.prisma.courseModule.findMany({
        where: { courseId: { in: courseIds }, isDeleted: false },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          course: { select: { id: true, title: true } },
          lessons: {
            where: { isDeleted: false },
            orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
            include: {
              resources: {
                where: { isDeleted: false },
                orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
                select: {
                  id: true,
                  title: true,
                  type: true,
                  fileUrl: true,
                  displayOrder: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.courseMaterial.findMany({
        where: { courseId: { in: courseIds } },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
        include: {
          course: { select: { id: true, title: true } },
        },
      }),
    ]);

    return {
      batchId: batch.id,
      courses: courses.map((course) => ({
        id: course.id,
        title: course.title,
        code: course.code,
        description: course.shortDescription ?? course.description,
        duration: this.formatCourseDuration(
          course.duration,
          course.durationType,
        ),
      })),
      trainers,
      modules: modules.map((module) => ({
        id: module.id,
        courseId: module.courseId,
        courseTitle: module.course.title,
        name: module.title,
        description: module.description,
        order: module.displayOrder,
        duration: module.duration,
        lessons: module.lessons.map((lesson) => ({
          id: lesson.id,
          name: lesson.title,
          description: lesson.description,
          order: lesson.displayOrder,
          duration: lesson.duration,
          contentType: lesson.contentType,
          videoUrl: lesson.videoUrl,
          resources: lesson.resources.map((resource) => ({
            id: resource.id,
            title: resource.title,
            type: resource.type,
            url: resource.fileUrl,
          })),
        })),
      })),
      materials: materials.map((material) => ({
        id: material.id,
        courseId: material.courseId,
        courseTitle: material.course.title,
        title: material.title,
        type: material.type,
        url: material.externalUrl,
      })),
    };
  }

  async getStudentBatchActivity(
    user: BranchAuthUser,
    batchId: string,
    studentId: string,
  ) {
    await this.access.assertFacultyCanAccessBatch(user, batchId);
    await this.access.assertFacultyCanAccessStudent(user, studentId, batchId);

    const enrollment = await this.prisma.enrollment.findFirst({
      where: {
        batchId,
        studentId,
        isDeleted: false,
        status: { in: VISIBLE_ENROLLMENT_STATUSES },
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            studentCode: true,
            status: true,
          },
        },
        batch: { select: { id: true, name: true, code: true } },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        'Student is not enrolled in this batch',
      );
    }

    const [attendanceRows, assessmentRows] = await Promise.all([
      this.prisma.attendance.findMany({
        where: {
          batchId,
          studentId,
          branchId: user.branchId,
        },
        orderBy: { date: 'desc' },
        include: {
          faculty: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.academicAssessment.findMany({
        where: {
          batchId,
          studentId,
          branchId: user.branchId,
        },
        orderBy: { date: 'desc' },
        include: {
          faculty: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
    ]);

    const attendanceItems = attendanceRows.map((row) => ({
      id: row.id,
      date: row.date,
      status: row.status,
      punchIn: row.punchIn,
      punchOut: row.punchOut,
      durationMinutes: row.durationMinutes,
      remarks: row.remarks,
      faculty: row.faculty
        ? {
            id: row.faculty.id,
            name: this.personName(row.faculty.firstName, row.faculty.lastName),
          }
        : null,
    }));

    return {
      student: {
        ...enrollment.student,
        name: this.personName(
          enrollment.student.firstName,
          enrollment.student.lastName,
        ),
      },
      batch: enrollment.batch,
      enrollmentDate:
        enrollment.admissionDate ??
        enrollment.joiningDate ??
        enrollment.createdAt,
      enrollmentStatus: enrollment.status,
      attendance: {
        items: attendanceItems,
        overall: this.summarizeAttendance(attendanceRows),
        weekly: this.summarizeAttendance(
          attendanceRows,
          this.periodStart('weekly'),
        ),
        monthly: this.summarizeAttendance(
          attendanceRows,
          this.periodStart('monthly'),
        ),
        yearly: this.summarizeAttendance(
          attendanceRows,
          this.periodStart('yearly'),
        ),
      },
      assessments: assessmentRows.map((row) => {
        const maxMarks = Number(row.maxMarks);
        const obtainedMarks = Number(row.obtainedMarks);

        return {
          id: row.id,
          type: row.type,
          name: row.name,
          date: row.date,
          maxMarks,
          obtainedMarks,
          percentage:
            maxMarks > 0 ? Math.round((obtainedMarks / maxMarks) * 100) : 0,
          remarks: row.remarks,
          faculty: row.faculty
            ? {
                id: row.faculty.id,
                name: this.personName(
                  row.faculty.firstName,
                  row.faculty.lastName,
                ),
              }
            : null,
        };
      }),
    };
  }

  async listStudents(user: BranchAuthUser) {
    if (this.access.isFaculty(user)) {
      const batchIds = await this.access.getAssignedBatchIds(user);

      if (!batchIds.length) {
        return [];
      }

      const enrollments = await this.prisma.enrollment.findMany({
        where: {
          batchId: { in: batchIds },
          isDeleted: false,
          status: { in: VISIBLE_ENROLLMENT_STATUSES },
          student: { isDeleted: false, branchId: user.branchId },
        },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              studentCode: true,
              status: true,
            },
          },
          batch: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      const unique = new Map<string, (typeof enrollments)[number]>();
      for (const item of enrollments) {
        if (!unique.has(item.student.id)) {
          unique.set(item.student.id, item);
        }
      }

      return [...unique.values()].map((item) => ({
        id: item.student.id,
        firstName: item.student.firstName,
        lastName: item.student.lastName,
        email: item.student.email,
        phone: item.student.phone,
        studentCode: item.student.studentCode,
        status: item.student.status,
        batchId: item.batch.id,
        batchName: item.batch.name,
      }));
    }

    const students = await this.prisma.student.findMany({
      where: { branchId: user.branchId, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        studentCode: true,
        status: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return students;
  }

  async getStudent(user: BranchAuthUser, studentId: string) {
    await this.access.assertFacultyCanAccessStudent(user, studentId);

    const student = await this.prisma.student.findFirst({
      where: { id: studentId, isDeleted: false },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        studentCode: true,
        status: true,
        branchId: true,
      },
    });

    if (!student) {
      throw new NotFoundException('Student not found');
    }

    return student;
  }

  async assignFaculty(
    user: BranchAuthUser,
    batchId: string,
    facultyId: string,
  ) {
    if (!this.access.isManager(user)) {
      throw new ForbiddenException('Role access denied');
    }

    await this.access.assertBatchInBranch(batchId, user.branchId);

    const faculty = await this.prisma.branchUser.findFirst({
      where: {
        id: facultyId,
        branchId: user.branchId,
        isDeleted: false,
        role: BranchUserRole.FACULTY,
      },
    });

    if (!faculty) {
      throw new BadRequestException(
        'Faculty must belong to this branch',
      );
    }

    const assignment = await this.prisma.batchFaculty.upsert({
      where: {
        batchId_branchUserId: {
          batchId,
          branchUserId: facultyId,
        },
      },
      update: { assignedBy: user.sub },
      create: {
        batchId,
        branchUserId: facultyId,
        assignedBy: user.sub,
      },
    });

    await this.access.log({
      user,
      action: 'FACULTY_ASSIGNED',
      resourceType: 'BatchFaculty',
      resourceId: assignment.id,
      metadata: { batchId, facultyId },
    });

    return assignment;
  }

  async unassignFaculty(
    user: BranchAuthUser,
    batchId: string,
    facultyId: string,
  ) {
    if (!this.access.isManager(user)) {
      throw new ForbiddenException('Role access denied');
    }

    await this.access.assertBatchInBranch(batchId, user.branchId);

    await this.prisma.batchFaculty.deleteMany({
      where: { batchId, branchUserId: facultyId },
    });

    await this.access.log({
      user,
      action: 'FACULTY_UNASSIGNED',
      resourceType: 'Batch',
      resourceId: batchId,
      metadata: { facultyId },
    });

    return { success: true };
  }

  async listEnrollments(
    user: BranchAuthUser,
    query: {
      search?: string;
      batchId?: string;
      courseId?: string;
      status?: EnrollmentStatus;
      skip?: number;
      take?: number;
    },
  ) {
    if (this.access.isInterviewer(user)) {
      throw new ForbiddenException('Role access denied');
    }

    const skip = query.skip ?? 0;
    const take = Math.min(query.take ?? 10, 100);
    const search = query.search?.trim();
    const assignedIds = this.access.isFaculty(user)
      ? await this.access.getAssignedBatchIds(user)
      : [];

    if (this.access.isFaculty(user) && !assignedIds.length) {
      return { items: [], count: 0, skip, take };
    }

    if (query.batchId) {
      await this.access.assertFacultyCanAccessBatch(user, query.batchId);
    }

    const where: Prisma.EnrollmentWhereInput = {
      branchId: user.branchId,
      isDeleted: false,
      student: { isDeleted: false },
      ...(this.access.isFaculty(user)
        ? { batchId: { in: assignedIds } }
        : {}),
      ...(query.batchId ? { batchId: query.batchId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    if (search) {
      where.OR = [
        { enrollmentNumber: { contains: search, mode: 'insensitive' } },
        { student: { firstName: { contains: search, mode: 'insensitive' } } },
        { student: { lastName: { contains: search, mode: 'insensitive' } } },
        { student: { email: { contains: search, mode: 'insensitive' } } },
        { student: { phone: { contains: search, mode: 'insensitive' } } },
        { student: { studentCode: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [rows, count] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              studentCode: true,
              status: true,
            },
          },
          batch: { select: { id: true, name: true, code: true } },
          course: { select: { id: true, title: true } },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      items: rows.map((item) => ({
        id: item.id,
        enrollmentNumber: item.enrollmentNumber,
        status: item.status,
        enrollmentDate: item.admissionDate ?? item.joiningDate ?? item.createdAt,
        student: item.student,
        batch: item.batch,
        course: item.course,
      })),
      count,
      skip,
      take,
    };
  }

  private batchListInclude() {
    return {
      course: { select: { id: true, title: true, code: true } },
      branch: {
        select: {
          id: true,
          branchName: true,
          branchCode: true,
          city: true,
          state: true,
          phone: true,
          email: true,
          addressLine1: true,
        },
      },
      trainers: {
        include: {
          trainer: { select: TRAINER_SELECT },
        },
      },
      facultyAssignments: {
        include: {
          faculty: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },
      _count: {
        select: {
          enrollments: {
            where: {
              isDeleted: false,
              status: { in: VISIBLE_ENROLLMENT_STATUSES },
            },
          },
        },
      },
    } satisfies Prisma.BatchInclude;
  }

  private toBatchDto(
    batch: {
      id: string;
      name: string;
      code: string;
      mode: string;
      status: string;
      startDate: Date;
      endDate: Date | null;
      startTime: string;
      endTime: string;
      daysOfWeek: DayOfWeek[];
      capacity: number;
      course: { id: string; title: string; code: string } | null;
      branch: {
        id: string;
        branchName: string;
        branchCode: string;
        city: string | null;
        state: string | null;
        phone: string | null;
        email: string | null;
        addressLine1: string | null;
      } | null;
      trainers: Array<{
        trainer: {
          id: string;
          firstName: string;
          lastName: string | null;
        };
      }>;
      facultyAssignments: Array<{
        faculty: {
          id: string;
          firstName: string;
          lastName: string | null;
          email: string;
        };
      }>;
      _count: { enrollments: number };
    },
    enrolledOverride?: number,
  ) {
    const enrolledStudents = enrolledOverride ?? batch._count.enrollments;
    const availableSeats = Math.max(0, batch.capacity - enrolledStudents);
    const totalWorkingDays = this.countWorkingDays(
      batch.startDate,
      batch.endDate,
      batch.daysOfWeek,
    );

    return {
      id: batch.id,
      name: batch.name,
      code: batch.code,
      mode: batch.mode,
      status: batch.status,
      startDate: batch.startDate,
      endDate: batch.endDate,
      startTime: batch.startTime,
      endTime: batch.endTime,
      daysOfWeek: batch.daysOfWeek,
      capacity: batch.capacity,
      enrolledStudents,
      availableSeats,
      totalWorkingDays,
      durationDays: this.countCalendarDays(batch.startDate, batch.endDate),
      course: batch.course,
      branch: batch.branch,
      trainers: batch.trainers.map((item) => ({
        id: item.trainer.id,
        name: this.personName(item.trainer.firstName, item.trainer.lastName),
      })),
      faculty: batch.facultyAssignments.map((item) => ({
        id: item.faculty.id,
        name: this.personName(item.faculty.firstName, item.faculty.lastName),
        email: item.faculty.email,
      })),
    };
  }

  private uniqueCourses<
    T extends { id: string; title: string; code: string } | null,
  >(courses: T[]) {
    const unique = new Map<string, NonNullable<T>>();
    for (const course of courses) {
      if (course && !unique.has(course.id)) {
        unique.set(course.id, course);
      }
    }
    return [...unique.values()];
  }

  private uniqueTrainers(
    trainers: Array<{
      id: string;
      firstName: string;
      lastName: string | null;
      email: string | null;
      phone: string | null;
      bio: string | null;
      qualification: string | null;
      experienceYears: number | null;
      specialization: string | null;
      profileImageUrl: string | null;
    } | null>,
  ) {
    const unique = new Map<
      string,
      {
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        bio: string | null;
        qualification: string | null;
        experienceYears: number | null;
        specialization: string | null;
        profileImageUrl: string | null;
      }
    >();

    for (const trainer of trainers) {
      if (!trainer || unique.has(trainer.id)) continue;
      unique.set(trainer.id, {
        id: trainer.id,
        name: this.personName(trainer.firstName, trainer.lastName),
        email: trainer.email,
        phone: trainer.phone,
        bio: trainer.bio,
        qualification: trainer.qualification,
        experienceYears: trainer.experienceYears,
        specialization: trainer.specialization,
        profileImageUrl: trainer.profileImageUrl,
      });
    }

    return [...unique.values()];
  }

  private personName(first: string, last?: string | null) {
    return [first, last].filter(Boolean).join(' ');
  }

  private formatCourseDuration(
    duration?: number | null,
    durationType?: string | null,
  ) {
    if (!duration) return null;
    const unit = (durationType ?? 'DAYS').toLowerCase();
    const singular = unit.replace(/s$/, '');
    return `${duration} ${duration === 1 ? singular : unit}`;
  }

  private countCalendarDays(start: Date, end: Date | null) {
    if (!end) return null;
    const startUtc = Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate(),
    );
    const endUtc = Date.UTC(
      end.getUTCFullYear(),
      end.getUTCMonth(),
      end.getUTCDate(),
    );
    return Math.max(1, Math.round((endUtc - startUtc) / 86_400_000) + 1);
  }

  private countWorkingDays(
    start: Date,
    end: Date | null,
    daysOfWeek: DayOfWeek[],
  ) {
    if (!end || !daysOfWeek.length) return null;
    const allowed = new Set(daysOfWeek.map((day) => DAY_INDEX[day]));
    let count = 0;
    const cursor = new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
    const last = new Date(
      Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()),
    );

    while (cursor.getTime() <= last.getTime()) {
      if (allowed.has(cursor.getUTCDay())) {
        count += 1;
      }
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return count;
  }

  private periodStart(period: 'weekly' | 'monthly' | 'yearly') {
    const now = new Date();
    if (period === 'weekly') {
      const day = now.getUTCDay();
      const mondayOffset = day === 0 ? 6 : day - 1;
      return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - mondayOffset),
      );
    }
    if (period === 'monthly') {
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    }
    return new Date(Date.UTC(now.getUTCFullYear(), 0, 1));
  }

  private summarizeAttendance(
    rows: Array<{ date: Date; status: AttendanceStatus }>,
    from?: Date,
  ) {
    const filtered = from
      ? rows.filter((row) => row.date.getTime() >= from.getTime())
      : rows;
    const present = filtered.filter(
      (row) => row.status === AttendanceStatus.PRESENT,
    ).length;
    const absent = filtered.filter(
      (row) => row.status === AttendanceStatus.ABSENT,
    ).length;
    const late = filtered.filter(
      (row) => row.status === AttendanceStatus.LATE,
    ).length;
    const leave = filtered.filter(
      (row) => row.status === AttendanceStatus.LEAVE,
    ).length;
    const total = filtered.length;
    const attended = present + late;

    return {
      present,
      absent,
      late,
      leave,
      total,
      percentage: total > 0 ? Math.round((attended / total) * 100) : 0,
    };
  }
}

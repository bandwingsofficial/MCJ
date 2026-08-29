import { AttendanceStatus } from '@prisma/client';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { BranchAttendanceService } from './branch-attendance.service';

type FakeAttendance = {
  id: string;
  branchId: string;
  batchId: string;
  batchCourseId: string;
  studentId: string;
  facultyId: string | null;
  date: Date;
  status: AttendanceStatus;
  punchIn: Date | null;
  punchOut: Date | null;
  durationMinutes: number | null;
  remarks: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function makeUser(overrides?: Partial<{ sub: string; branchId: string; role: string }>) {
  return {
    sub: overrides?.sub ?? 'faculty-1',
    sessionId: 'session-1',
    branchId: overrides?.branchId ?? 'branch-malleswaram',
    email: 'faculty@example.com',
    role: overrides?.role ?? 'FACULTY',
    permissions: [],
  };
}

describe('BranchAttendanceService session integrity', () => {
  const branchId = 'branch-malleswaram';
  const otherBranchId = 'branch-other';
  const morningBatchId = 'batch-morning';
  const eveningBatchId = 'batch-evening';
  const session1Id = 'bc-session-1';
  const session2Id = 'bc-session-2';
  const studentAkshay = 'student-akshay';
  const studentOther = 'student-other';

  let store: FakeAttendance[];
  let prisma: any;
  let access: any;
  let service: BranchAttendanceService;

  beforeEach(() => {
    store = [];

    access = {
      isFaculty: () => true,
      assertFacultyCanAccessBatch: jest.fn(async (_user: unknown, batchId: string) => {
        if (batchId === eveningBatchId) {
          // still in branch, allowed for access checks unless cross-branch
        }
      }),
      assertFacultyCanAccessStudent: jest.fn(
        async (_user: unknown, studentId: string, batchId?: string) => {
          if (studentId === studentOther && batchId === morningBatchId) {
            throw new ForbiddenException('Faculty is not assigned to this student');
          }
        },
      ),
      visibleBatchIds: jest.fn(async () => null),
      log: jest.fn(async () => undefined),
    };

    const batchCourseById: Record<string, any> = {
      [session1Id]: {
        id: session1Id,
        batchId: morningBatchId,
        isDeleted: false,
        course: { id: 'course-ca', title: 'CA Foundation', code: 'CR0001' },
        session: { id: 'sess-1', sessionNumber: 1 },
        batch: {
          id: morningBatchId,
          name: 'Morning',
          code: 'BCH0001',
          branchId,
          status: 'ONGOING',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          isActive: true,
          isDeleted: false,
          branch: {
            id: branchId,
            branchName: 'Malleswaram',
            branchCode: 'BR001',
          },
        },
      },
      [session2Id]: {
        id: session2Id,
        batchId: morningBatchId,
        isDeleted: false,
        course: {
          id: 'course-fe',
          title: 'Frontend Development',
          code: 'CR0002',
        },
        session: { id: 'sess-2', sessionNumber: 2 },
        batch: {
          id: morningBatchId,
          name: 'Morning',
          code: 'BCH0001',
          branchId,
          status: 'ONGOING',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          isActive: true,
          isDeleted: false,
          branch: {
            id: branchId,
            branchName: 'Malleswaram',
            branchCode: 'BR001',
          },
        },
      },
      'bc-other-branch': {
        id: 'bc-other-branch',
        batchId: 'batch-other',
        isDeleted: false,
        course: { id: 'c', title: 'X', code: 'X' },
        session: { id: 's', sessionNumber: 1 },
        batch: {
          id: 'batch-other',
          name: 'Other',
          code: 'BCH9',
          branchId: otherBranchId,
          status: 'ONGOING',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          isActive: true,
          isDeleted: false,
          branch: {
            id: otherBranchId,
            branchName: 'Other',
            branchCode: 'BR999',
          },
        },
      },
      'bc-evening': {
        id: 'bc-evening',
        batchId: eveningBatchId,
        isDeleted: false,
        course: { id: 'c2', title: 'Evening Course', code: 'CR9' },
        session: { id: 's3', sessionNumber: 1 },
        batch: {
          id: eveningBatchId,
          name: 'Evening',
          code: 'BCH0002',
          branchId,
          status: 'ONGOING',
          startDate: new Date('2026-01-01'),
          endDate: new Date('2026-12-31'),
          isActive: true,
          isDeleted: false,
          branch: {
            id: branchId,
            branchName: 'Malleswaram',
            branchCode: 'BR001',
          },
        },
      },
    };

    const enrich = (row: FakeAttendance) => {
      const bc = batchCourseById[row.batchCourseId];
      return {
        ...row,
        student: {
          id: row.studentId,
          firstName: row.studentId === studentAkshay ? 'Akshay' : 'Other',
          lastName: row.studentId === studentAkshay ? 'Badiger' : 'Student',
          studentCode:
            row.studentId === studentAkshay ? 'STU0001' : 'STU0002',
        },
        batch: {
          id: bc.batch.id,
          name: bc.batch.name,
          code: bc.batch.code,
        },
        faculty: {
          id: 'faculty-1',
          firstName: 'Fac',
          lastName: 'Ulty',
        },
        batchCourse: {
          id: bc.id,
          courseId: bc.course.id,
          course: bc.course,
          session: bc.session,
        },
        branch: bc.batch.branch,
      };
    };

    prisma = {
      batchCourse: {
        findFirst: jest.fn(async ({ where }: any) => {
          const row = batchCourseById[where.id];
          if (!row || row.isDeleted) return null;
          if (where.batch?.branchId && row.batch.branchId !== where.batch.branchId) {
            return null;
          }
          return row;
        }),
        findMany: jest.fn(async ({ where }: any) => {
          return Object.values(batchCourseById).filter(
            (row: any) =>
              row.batchId === where.batchId &&
              !row.isDeleted &&
              row.batch.branchId === where.batch.branchId,
          );
        }),
      },
      enrollment: {
        findMany: jest.fn(async () => [
          {
            id: 'enr-1',
            studentId: studentAkshay,
            status: 'ACTIVE',
            student: {
              id: studentAkshay,
              firstName: 'Akshay',
              lastName: 'Badiger',
              studentCode: 'STU0001',
              status: 'ACTIVE',
            },
          },
        ]),
        findFirst: jest.fn(async ({ where }: any) => {
          if (where.studentId && where.studentId !== studentAkshay) {
            return null;
          }
          return {
            id: 'enr-1',
            studentId: studentAkshay,
            status: 'ACTIVE',
            student: {
              id: studentAkshay,
              firstName: 'Akshay',
              lastName: 'Badiger',
              studentCode: 'STU0001',
              status: 'ACTIVE',
              email: 'a@example.com',
              phone: null,
            },
            batch: {
              id: morningBatchId,
              name: 'Morning',
              code: 'BCH0001',
              branch: {
                id: branchId,
                branchName: 'Malleswaram',
                branchCode: 'BR001',
              },
            },
          };
        }),
      },
      batch: {
        findFirst: jest.fn(async ({ where }: any) => {
          if (where.id !== morningBatchId || where.branchId !== branchId) {
            return null;
          }
          return {
            id: morningBatchId,
            name: 'Morning',
            code: 'BCH0001',
            startDate: new Date('2026-08-01T00:00:00.000Z'),
            endDate: new Date('2026-08-31T00:00:00.000Z'),
            daysOfWeek: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'],
            branch: {
              id: branchId,
              branchName: 'Malleswaram',
              branchCode: 'BR001',
            },
          };
        }),
      },
      attendance: {
        findUnique: jest.fn(async ({ where }: any) => {
          const key = where.studentId_batchCourseId_date;
          return (
            store.find(
              (row) =>
                row.studentId === key.studentId &&
                row.batchCourseId === key.batchCourseId &&
                row.date.getTime() === key.date.getTime(),
            ) ?? null
          );
        }),
        findMany: jest.fn(async ({ where }: any) => {
          return store
            .filter((row) => {
              if (where.branchId && row.branchId !== where.branchId) return false;
              if (where.batchId && row.batchId !== where.batchId) return false;
              if (where.batchCourseId && row.batchCourseId !== where.batchCourseId)
                return false;
              if (where.studentId && row.studentId !== where.studentId) return false;
              if (where.studentId?.in && !where.studentId.in.includes(row.studentId))
                return false;
              if (where.date?.gte && row.date < where.date.gte) return false;
              if (where.date?.lte && row.date > where.date.lte) return false;
              return true;
            })
            .map(enrich);
        }),
        groupBy: jest.fn(async ({ by, where }: any) => {
          const filtered = store.filter((row) => {
            if (where.branchId && row.branchId !== where.branchId) return false;
            if (where.batchId && row.batchId !== where.batchId) return false;
            if (where.studentId && row.studentId !== where.studentId) return false;
            return true;
          });

          if (by.join(',') === 'date,batchCourseId') {
            const keys = new Set(
              filtered.map(
                (row) =>
                  `${row.date.toISOString().slice(0, 10)}:${row.batchCourseId}`,
              ),
            );
            return [...keys].map((key) => {
              const [date, batchCourseId] = key.split(':');
              return {
                date: new Date(`${date}T00:00:00.000Z`),
                batchCourseId,
              };
            });
          }

          if (by.join(',') === 'studentId,status') {
            const map = new Map<string, number>();
            for (const row of filtered) {
              const key = `${row.studentId}:${row.status}`;
              map.set(key, (map.get(key) ?? 0) + 1);
            }
            return [...map.entries()].map(([key, count]) => {
              const [studentId, status] = key.split(':');
              return {
                studentId,
                status,
                _count: { _all: count },
              };
            });
          }

          return [];
        }),
        create: jest.fn(async ({ data }: any) => {
          const row: FakeAttendance = {
            id: `att-${store.length + 1}`,
            branchId: data.branchId,
            batchId: data.batchId,
            batchCourseId: data.batchCourseId,
            studentId: data.studentId,
            facultyId: data.facultyId ?? null,
            date: data.date,
            status: data.status,
            punchIn: data.punchIn ?? null,
            punchOut: data.punchOut ?? null,
            durationMinutes: data.durationMinutes ?? null,
            remarks: data.remarks ?? null,
            createdBy: data.createdBy ?? null,
            updatedBy: data.updatedBy ?? null,
            createdAt: new Date('2026-08-29T10:32:00.000Z'),
            updatedAt: new Date('2026-08-29T10:32:00.000Z'),
          };
          store.push(row);
          return enrich(row);
        }),
        update: jest.fn(async ({ where, data }: any) => {
          const idx = store.findIndex((row) => row.id === where.id);
          store[idx] = { ...store[idx], ...data };
          return enrich(store[idx]);
        }),
        count: jest.fn(async () => store.length),
      },
      $transaction: jest.fn(async (fn: any) => fn(prisma)),
    };

    service = new BranchAttendanceService(prisma, access);
  });

  it('creates present attendance for session 1', async () => {
    const result = await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.PRESENT,
    });

    expect(result.status).toBe('PRESENT');
    expect(result.session.batchCourseId).toBe(session1Id);
    expect(result.session.label).toBe('Session 1 - CA Foundation');
    expect(store).toHaveLength(1);
  });

  it('stores independent records for session 1 present and session 2 absent', async () => {
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.PRESENT,
    });
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session2Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.ABSENT,
    });

    expect(store).toHaveLength(2);
    expect(store[0].status).toBe(AttendanceStatus.PRESENT);
    expect(store[1].status).toBe(AttendanceStatus.ABSENT);
    expect(store[0].batchCourseId).not.toBe(store[1].batchCourseId);
  });

  it('updates existing attendance instead of duplicating', async () => {
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.PRESENT,
    });
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.LATE,
    });

    expect(store).toHaveLength(1);
    expect(store[0].status).toBe(AttendanceStatus.LATE);
  });

  it('rejects cross-batch session assignment', async () => {
    await expect(
      service.upsertAttendance(makeUser(), {
        batchId: eveningBatchId,
        batchCourseId: session1Id,
        studentId: studentAkshay,
        date: '2026-08-29',
        status: AttendanceStatus.PRESENT,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects cross-branch session', async () => {
    await expect(
      service.upsertAttendance(makeUser(), {
        batchId: 'batch-other',
        batchCourseId: 'bc-other-branch',
        studentId: studentAkshay,
        date: '2026-08-29',
        status: AttendanceStatus.PRESENT,
      }),
    ).rejects.toThrow();
  });

  it('rejects students not enrolled in the batch on bulk save', async () => {
    await expect(
      service.bulkUpsert(makeUser(), {
        batchId: morningBatchId,
        batchCourseId: session1Id,
        date: '2026-08-29',
        records: [
          { studentId: studentAkshay, status: AttendanceStatus.PRESENT },
          { studentId: studentOther, status: AttendanceStatus.ABSENT },
        ],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('bulk saves multiple students for one session', async () => {
    prisma.enrollment.findMany = jest.fn(async () => [
      {
        studentId: studentAkshay,
        id: 'enr-1',
        student: {
          id: studentAkshay,
          firstName: 'Akshay',
          lastName: 'Badiger',
          studentCode: 'STU0001',
        },
      },
      {
        studentId: 'student-b',
        id: 'enr-2',
        student: {
          id: 'student-b',
          firstName: 'Student',
          lastName: 'B',
          studentCode: 'STU0002',
        },
      },
    ]);

    const result = await service.bulkUpsert(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      date: '2026-08-29',
      records: [
        { studentId: studentAkshay, status: AttendanceStatus.PRESENT },
        { studentId: 'student-b', status: AttendanceStatus.LATE },
      ],
    });

    expect(result.items).toHaveLength(2);
    expect(result.summary.present).toBe(1);
    expect(result.summary.late).toBe(1);
    expect(store).toHaveLength(2);
  });

  it('changing session 1 does not change session 2', async () => {
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.PRESENT,
    });
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session2Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.ABSENT,
    });

    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.LATE,
    });

    const s1 = store.find((row) => row.batchCourseId === session1Id)!;
    const s2 = store.find((row) => row.batchCourseId === session2Id)!;
    expect(s1.status).toBe(AttendanceStatus.LATE);
    expect(s2.status).toBe(AttendanceStatus.ABSENT);
  });

  it('computes batch analytics with conducted sessions and Present+Late ratio', async () => {
    const mark = async (
      batchCourseId: string,
      date: string,
      status: AttendanceStatus,
    ) => {
      await service.upsertAttendance(makeUser(), {
        batchId: morningBatchId,
        batchCourseId,
        studentId: studentAkshay,
        date,
        status,
      });
    };

    await mark(session1Id, '2026-08-26', AttendanceStatus.PRESENT);
    await mark(session2Id, '2026-08-26', AttendanceStatus.PRESENT);
    await mark(session1Id, '2026-08-27', AttendanceStatus.ABSENT);
    await mark(session2Id, '2026-08-27', AttendanceStatus.LATE);

    const analytics = await service.getBatchAttendanceAnalytics(
      makeUser(),
      morningBatchId,
    );

    expect(analytics.overview.sessionsConducted).toBe(4);
    expect(analytics.overview.workingDays).toBeGreaterThan(0);
    expect(analytics.students).toHaveLength(1);

    const student = analytics.students[0];
    expect(student.present).toBe(2);
    expect(student.absent).toBe(1);
    expect(student.late).toBe(1);
    expect(student.attended).toBe(3);
    expect(student.ratioLabel).toBe('3 / 4');
    expect(student.percentage).toBe(75);
  });

  it('returns student detail scoped to batch with monthly breakdown', async () => {
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session1Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.PRESENT,
    });
    await service.upsertAttendance(makeUser(), {
      batchId: morningBatchId,
      batchCourseId: session2Id,
      studentId: studentAkshay,
      date: '2026-08-29',
      status: AttendanceStatus.ABSENT,
    });

    const detail = await service.getStudentBatchAttendanceDetail(
      makeUser(),
      morningBatchId,
      studentAkshay,
    );

    expect(detail.summary.sessionsConducted).toBe(2);
    expect(detail.summary.present).toBe(1);
    expect(detail.summary.absent).toBe(1);
    expect(detail.summary.ratioLabel).toBe('1 / 2');
    expect(detail.summary.percentage).toBe(50);
    expect(detail.history).toHaveLength(2);
    expect(detail.history[0].markedAt).toBeTruthy();
    expect(detail.monthly[0]?.monthKey).toBe('2026-08');
    expect(detail.branch.id).toBe(branchId);
    expect(detail.batch.id).toBe(morningBatchId);
  });

  it('blocks student attendance detail when not enrolled in batch', async () => {
    await expect(
      service.getStudentBatchAttendanceDetail(
        makeUser(),
        morningBatchId,
        studentOther,
      ),
    ).rejects.toBeTruthy();
  });
});

const { PrismaClient, EnrollmentStatus } = require('@prisma/client');

const prisma = new PrismaClient();

const CURRENT_STATUSES = [
  EnrollmentStatus.PENDING,
  EnrollmentStatus.PENDING_APPROVAL,
  EnrollmentStatus.ADMITTED,
  EnrollmentStatus.ACTIVE,
];

async function main() {
  const groups = await prisma.enrollment.groupBy({
    by: ['studentId'],
    where: {
      isDeleted: false,
      status: { in: CURRENT_STATUSES },
    },
    _count: { studentId: true },
    having: {
      studentId: { _count: { gt: 1 } },
    },
  });

  const report = [];

  for (const group of groups) {
    const rows = await prisma.enrollment.findMany({
      where: {
        studentId: group.studentId,
        isDeleted: false,
        status: { in: CURRENT_STATUSES },
      },
      select: {
        id: true,
        status: true,
        isActive: true,
        createdAt: true,
        student: {
          select: {
            studentCode: true,
            firstName: true,
            lastName: true,
          },
        },
        branch: { select: { branchName: true, branchCode: true } },
        batch: { select: { name: true, code: true } },
        course: { select: { title: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    report.push({
      studentId: group.studentId,
      studentCode: rows[0]?.student.studentCode,
      studentName: [rows[0]?.student.firstName, rows[0]?.student.lastName]
        .filter(Boolean)
        .join(' '),
      currentCount: rows.length,
      enrollments: rows.map((row) => ({
        enrollmentId: row.id,
        status: row.status,
        isActive: row.isActive,
        branch: row.branch.branchName,
        batch: row.batch.code
          ? `${row.batch.name} (${row.batch.code})`
          : row.batch.name,
        course: row.course.title,
        createdAt: row.createdAt,
      })),
    });
  }

  console.log(
    JSON.stringify(
      {
        duplicateStudentCount: report.length,
        recordsLeftUntouched: true,
        students: report,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

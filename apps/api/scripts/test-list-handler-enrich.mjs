import { createRequire } from 'module';

const require = createRequire(import.meta.url);

async function main() {
  const { PrismaService } = require('../dist/infrastructure/prisma/prisma.service.js');
  const { PrismaJobApplicationRepository } = require('../dist/modules/job-application/infrastructure/repositories/prisma-job-application.repository.js');
  const { PrismaStudentRepository } = require('../dist/modules/student/infrastructure/repositories/prisma-student.repository.js');
  const { ListJobApplicationsHandler } = require('../dist/modules/job-application/application/list-job-applications/list-job-applications.handler.js');
  const { ListJobApplicationsQuery } = require('../dist/modules/job-application/application/list-job-applications/list-job-applications.query.js');
  const { JobApplicationStatus } = require('../dist/modules/job-application/domain/enums/job-application-status.enum.js');

  const prisma = new PrismaService();
  await prisma.$connect();

  const applicationRepo = new PrismaJobApplicationRepository(prisma);
  const studentRepo = new PrismaStudentRepository(prisma);
  const handler = new ListJobApplicationsHandler(applicationRepo, studentRepo);

  const result = await handler.execute(
    new ListJobApplicationsQuery(
      undefined,
      undefined,
      JobApplicationStatus.SELECTED,
      undefined,
      undefined,
      undefined,
      undefined,
      false,
      0,
      20,
    ),
  );

  console.log(
    result.items.map((item) => ({
      applicationNumber: item.applicationNumber,
      applicantName: item.applicantName,
      studentId: item.studentId,
      studentCode: item.student?.studentCode ?? null,
    })),
  );

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

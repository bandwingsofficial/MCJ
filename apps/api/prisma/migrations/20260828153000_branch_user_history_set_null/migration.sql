-- Preserve attendance, assessments, interviews, and audit rows when a
-- BranchUser login is permanently deleted. BatchFaculty assignments remain
-- cascading because they are access links, not academic history.

ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_facultyId_fkey";
ALTER TABLE "Attendance" ALTER COLUMN "facultyId" DROP NOT NULL;
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "BranchUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "AcademicAssessment" DROP CONSTRAINT "AcademicAssessment_facultyId_fkey";
ALTER TABLE "AcademicAssessment" ALTER COLUMN "facultyId" DROP NOT NULL;
ALTER TABLE "AcademicAssessment" ADD CONSTRAINT "AcademicAssessment_facultyId_fkey" FOREIGN KEY ("facultyId") REFERENCES "BranchUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Interview" DROP CONSTRAINT "Interview_interviewerId_fkey";
ALTER TABLE "Interview" ALTER COLUMN "interviewerId" DROP NOT NULL;
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "BranchUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "BranchActivityLog" DROP CONSTRAINT "BranchActivityLog_actorId_fkey";
ALTER TABLE "BranchActivityLog" ALTER COLUMN "actorId" DROP NOT NULL;
ALTER TABLE "BranchActivityLog" ADD CONSTRAINT "BranchActivityLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "BranchUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

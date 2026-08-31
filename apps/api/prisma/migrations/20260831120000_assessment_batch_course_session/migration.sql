-- Link assessments to batch course sessions and group multi-student marks.

ALTER TABLE "AcademicAssessment" ADD COLUMN "batchCourseId" TEXT;
ALTER TABLE "AcademicAssessment" ADD COLUMN "assessmentGroupId" TEXT;

CREATE INDEX "AcademicAssessment_batchCourseId_idx" ON "AcademicAssessment"("batchCourseId");
CREATE INDEX "AcademicAssessment_assessmentGroupId_idx" ON "AcademicAssessment"("assessmentGroupId");
CREATE INDEX "AcademicAssessment_batchCourseId_date_idx" ON "AcademicAssessment"("batchCourseId", "date");

CREATE UNIQUE INDEX "AcademicAssessment_assessmentGroupId_studentId_key"
  ON "AcademicAssessment"("assessmentGroupId", "studentId");

ALTER TABLE "AcademicAssessment"
  ADD CONSTRAINT "AcademicAssessment_batchCourseId_fkey"
  FOREIGN KEY ("batchCourseId") REFERENCES "BatchCourse"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

import {
  Batch,
} from "@/src/features/batches/types/batch.types";

export const batchMapper = {
  toForm(batch: Batch) {
    return {
      name: batch.name,
      code: batch.code,
      description:
        batch.description ?? "",

      courseId: batch.courseId,

      branchId:
        batch.branchId ?? "",

      startDate:
        batch.startDate.split("T")[0],

      endDate:
        batch.endDate
          ? batch.endDate.split("T")[0]
          : "",

      startTime:
        batch.startTime,

      endTime:
        batch.endTime,

      daysOfWeek:
        batch.daysOfWeek,

      capacity:
        batch.capacity,

      enrolledCount:
        batch.enrolledCount,

      mode: batch.mode,

      classroom:
        batch.classroom ?? "",

      meetingLink:
        batch.meetingLink ?? "",

      isFeatured:
        batch.isFeatured,

      trainerIds:
        batch.trainers.map(
          (trainer) => trainer.id,
        ),
    };
  },
};
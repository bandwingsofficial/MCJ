import type {
  Trainer,
  TrainerCourse,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerListPayload {
  items?: Trainer[];
  total?: number;
}

export function normalizeTrainerCourses(courses: unknown): TrainerCourse[] {
  if (!Array.isArray(courses)) {
    return [];
  }

  return courses
    .filter(
      (course): course is TrainerCourse =>
        Boolean(
          course &&
            typeof course === "object" &&
            "id" in course &&
            typeof (course as TrainerCourse).id === "string",
        ),
    )
    .map((course) => ({
      id: course.id,
      title: course.title ?? "",
    }));
}

export function normalizeTrainer(trainer: Trainer): Trainer {
  return {
    ...trainer,
    courses: normalizeTrainerCourses(trainer.courses),
  };
}

export function normalizeTrainerList(payload: unknown): Trainer[] {
  if (Array.isArray(payload)) {
    return payload.map((trainer) => normalizeTrainer(trainer));
  }

  if (payload && typeof payload === "object" && "items" in payload) {
    const items = (payload as TrainerListPayload).items;
    return Array.isArray(items)
      ? items.map((trainer) => normalizeTrainer(trainer))
      : [];
  }

  return [];
}

export function filterTrainersByCourseId(
  trainers: Trainer[],
  courseId: string,
): Trainer[] {
  return trainers.filter((trainer) =>
    trainer.courses.some((course) => course.id === courseId),
  );
}

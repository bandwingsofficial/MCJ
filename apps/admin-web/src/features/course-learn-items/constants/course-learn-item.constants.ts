import type { CourseLearnItemFormValues } from "@/src/features/course-learn-items/types";

export const COURSE_LEARN_ITEM_IMAGE_URL_MAX_LENGTH = 2048;

export const DEFAULT_COURSE_LEARN_ITEM_FORM_VALUES: CourseLearnItemFormValues =
  {
    lessonId: "",
    title: "",
    explanation: "",
    imageUrl: "",
    keyLearningPoints: [],
    finalThoughts: "",
    summary: "",
  };

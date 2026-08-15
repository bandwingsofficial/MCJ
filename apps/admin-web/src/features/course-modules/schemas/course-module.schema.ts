import { z } from "zod";

import {
  COURSE_MODULE_CONSTANTS,
} from "@/src/features/course-modules/constants/course-module.constants";
import {
  MODULE_WORD_LIMITS,
  wordLimitRefine,
} from "@/src/features/course-modules/utils/module-form-validation";

export const createCourseModuleSchema =
  z.object({
    courseId: z
      .string()
      .uuid(
        "Course is required."
      ),

    title: z
      .string()
      .trim()
      .min(
        1,
        "Title is required."
      )
      .max(
        COURSE_MODULE_CONSTANTS.MAX_TITLE_LENGTH,
        `Title cannot exceed ${COURSE_MODULE_CONSTANTS.MAX_TITLE_LENGTH} characters.`
      ),

    description: z
      .string()
      .refine(wordLimitRefine(MODULE_WORD_LIMITS.moduleDescription), {
        message: `Description must not exceed ${MODULE_WORD_LIMITS.moduleDescription} words.`,
      }),

    keySkills: z
      .array(
        z
          .string()
          .trim()
          .min(
            1,
            "Skill cannot be empty."
          )
          .max(
            COURSE_MODULE_CONSTANTS.MAX_KEY_SKILL_LENGTH
          )
      )
      .max(
        COURSE_MODULE_CONSTANTS.MAX_KEY_SKILLS
      ),
  });

export const updateCourseModuleSchema =
  createCourseModuleSchema.omit({
    courseId: true,
  });

export const moveCourseModuleSchema =
  z.object({
    newPosition: z
      .number()
      .int()
      .positive(),
  });

export type CreateCourseModuleForm =
  z.infer<
    typeof createCourseModuleSchema
  >;

export type UpdateCourseModuleForm =
  z.infer<
    typeof updateCourseModuleSchema
  >;

export type MoveCourseModuleForm =
  z.infer<
    typeof moveCourseModuleSchema
  >;

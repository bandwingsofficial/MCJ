import type { CourseListItem } from "@/src/features/courses/types/course.types";



export type CourseBlockingBatch = {

  batchId: string;

  batchName: string;

  lifecycleStatus: "UPCOMING" | "ONGOING";

};



export type CourseDependencySummary = {

  canDelete: boolean;

  canDeactivate: boolean;

  blockingBatches: CourseBlockingBatch[];

};



export type CourseDependencyApiData = {

  canDelete: boolean;

  canDeactivate?: boolean;

  blockingBatches?: CourseBlockingBatch[];

};



export function parseCourseDependencySummary(
  data: CourseDependencyApiData,
): CourseDependencySummary {
  return {
    canDelete: data.canDelete,
    canDeactivate: data.canDeactivate ?? data.canDelete,
    blockingBatches: data.blockingBatches ?? [],
  };
}



export function isCourseDeleteAllowed(

  summary: CourseDependencySummary | null,

): boolean {

  return summary?.canDelete === true;

}



export function isCourseDeactivateAllowed(

  summary: CourseDependencySummary | null,

): boolean {

  return summary?.canDeactivate === true;

}



function formatBatchLine(batch: CourseBlockingBatch): string {

  const statusLabel =

    batch.lifecycleStatus === "UPCOMING" ? "Upcoming" : "Ongoing";

  return `${statusLabel} ${batch.batchName}`;

}



function buildBlockedBatchDescription(

  summary: CourseDependencySummary | null,

  action: "deactivate" | "delete",

): string {

  if (!summary) {

    return "Unable to verify batch assignments. Please try again.";

  }



  const lines = summary.blockingBatches.map(

    (batch) => `- ${formatBatchLine(batch)}`,

  );



  if (action === "deactivate") {

    return [

      "This course cannot be deactivated because it is currently assigned to the following batch(es):",

      "",

      ...lines,

      "",

      "Remove the course from those batches before deactivating it.",

    ].join("\n");

  }



  return [

    "This course cannot be deleted because it is currently assigned to the following batch(es):",

    "",

    ...lines,

    "",

    "Remove the course from those batches before deleting it.",

  ].join("\n");

}



export function buildCourseDeleteDescription(

  summary: CourseDependencySummary | null,

): string {

  if (!summary) {

    return "Unable to verify batch assignments. Please try again.";

  }



  if (!summary.canDelete) {

    return buildBlockedBatchDescription(summary, "delete");

  }



  return "This will archive the course. It will no longer be active, but you can restore it later from the course management page.";

}



export function buildCourseDeactivateDescription(

  summary: CourseDependencySummary | null,

): string {

  if (!summary) {

    return "Unable to verify batch assignments. Please try again.";

  }



  if (!summary.canDeactivate) {

    return buildBlockedBatchDescription(summary, "deactivate");

  }



  return "Students will no longer be able to access this course while it is inactive.";

}



export type BulkCourseBatchBlock = {

  courseTitle: string;

  batches: CourseBlockingBatch[];

};



export type LoadCourseDependencySummary = (

  courseId: string,

) => Promise<CourseDependencySummary>;



export async function collectBulkCourseBatchBlocks(

  courses: CourseListItem[],

  courseIds: string[],

  loadSummary: LoadCourseDependencySummary,

  action: "deactivate" | "delete" = "delete",

): Promise<BulkCourseBatchBlock[]> {

  const byId = new Map(courses.map((course) => [course.id, course]));



  const isAllowed =

    action === "deactivate"

      ? isCourseDeactivateAllowed

      : isCourseDeleteAllowed;



  const blocks = (

    await Promise.all(

      courseIds.map(async (courseId) => {

        const summary = await loadSummary(courseId);



        if (isAllowed(summary)) {

          return null;

        }



        const course = byId.get(courseId);



        return {

          courseTitle: course?.title ?? "Unknown course",

          batches: summary.blockingBatches,

        } satisfies BulkCourseBatchBlock;

      }),

    )

  ).filter((entry): entry is BulkCourseBatchBlock => entry !== null);



  blocks.sort((left, right) =>

    left.courseTitle.localeCompare(right.courseTitle),

  );



  return blocks;

}



function buildBulkBlockedDescription(

  entries: BulkCourseBatchBlock[],

  action: "deactivate" | "delete",

): string {

  const lines = entries.flatMap((entry) => {

    const batchLines = entry.batches.map(

      (batch) => `- ${formatBatchLine(batch)}`,

    );



    return [entry.courseTitle, ...batchLines, ""];

  });



  if (action === "deactivate") {

    return [

      "Cannot deactivate the selected courses because they are assigned to active batches:",

      "",

      ...lines,

      "Remove these courses from the listed batches before deactivating them.",

    ]

      .join("\n")

      .trimEnd();

  }



  return [

    "Cannot delete the selected courses because they are assigned to active batches:",

    "",

    ...lines,

    "Remove these courses from the listed batches before deleting them.",

  ]

    .join("\n")

    .trimEnd();

}



export function buildBulkCourseDeleteBlockedDescription(

  entries: BulkCourseBatchBlock[],

): string {

  return buildBulkBlockedDescription(entries, "delete");

}



export function buildBulkCourseDeactivateBlockedDescription(

  entries: BulkCourseBatchBlock[],

): string {

  return buildBulkBlockedDescription(entries, "deactivate");

}



export function buildBulkCourseDeleteConfirmDescription(): string {

  return "Are you sure you want to archive the selected courses?";

}



export function buildCoursePermanentDeleteDescription(): string {

  return "This action cannot be undone. Are you sure you want to permanently delete this course?";

}



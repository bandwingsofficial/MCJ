"use client";

import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import {
  CourseListItem,
} from "@/src/features/courses/types/course.types";

import { CourseStatusBadge } from "./course-status-badge";

import { CourseActions } from "./course-actions";

interface Props {
  courses: CourseListItem[];

  onView: (
    course: CourseListItem
  ) => void;

  onEdit: (
    course: CourseListItem
  ) => void;

  onDelete: (
    course: CourseListItem
  ) => void;

  onRestore: (
    course: CourseListItem
  ) => void;

  onActivate: (
    course: CourseListItem
  ) => void;

  onDeactivate: (
    course: CourseListItem
  ) => void;

  onPermanentDelete: (
    course: CourseListItem
  ) => void;
}

export function CourseTable({
  courses,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onActivate,
  onDeactivate,
  onPermanentDelete,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Image
          </TableHead>

          <TableHead>
            Title
          </TableHead>

          <TableHead>
            Mode
          </TableHead>

          <TableHead>
            Level
          </TableHead>

          <TableHead>
            Price
          </TableHead>

          <TableHead>
            Language
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Created At
          </TableHead>

          <TableHead>
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {courses.map(
          (course) => (
            <TableRow
              key={course.id}
            >
              <TableCell>
                {course.thumbnailUrl ? (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-white p-1">
                    <Image
                      src={
                        course.thumbnailUrl
                      }
                      alt={
                        course.title
                      }
                      width={60}
                      height={60}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div>
                  <p className="font-medium">
                    {
                      course.title
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      course.slug
                    }
                  </p>
                </div>
              </TableCell>

              <TableCell>
                {(course as any).modes &&
                (course as any).modes
                  .length > 0
                  ? (
                      course as any
                    ).modes.join(
                      ", "
                    )
                  : course.mode ||
                    "-"}
              </TableCell>

              <TableCell>
                {
                  course.level
                }
              </TableCell>

              <TableCell>
                {course.isFree
                  ? "Free"
                  : `₹${course.discountPrice}`}
              </TableCell>

              <TableCell>
                {
                  course.language
                }
              </TableCell>

              <TableCell>
                <CourseStatusBadge
                  status={
                    course.status
                  }
                />
              </TableCell>

              <TableCell>
                {new Date(
                  course.createdAt
                ).toLocaleDateString()}
              </TableCell>

              <TableCell>
                <CourseActions
                  course={
                    course
                  }
                  onView={
                    onView
                  }
                  onEdit={
                    onEdit
                  }
                  onDelete={
                    onDelete
                  }
                  onRestore={
                    onRestore
                  }
                  onActivate={
                    onActivate
                  }
                  onDeactivate={
                    onDeactivate
                  }
                  onPermanentDelete={
                    onPermanentDelete
                  }
                />
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}
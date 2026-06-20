"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { Avatar } from "@/src/shared/components/ui/avatar";

import {
  Student,
} from "@/src/features/students/types/student.types";

import { StudentStatusBadge } from "./StudentStatusBadge";

import { StudentRowActions } from "./StudentRowActions";

interface Props {
  students: Student[];

  onEdit: (
    id: string
  ) => void;

  onActivate: (
    id: string
  ) => void;

  onDeactivate: (
    id: string
  ) => void;

  onDelete: (
    id: string
  ) => void;

  onView?: (
    id: string
  ) => void;
}

export function StudentTable({
  students,
  onActivate,
  onDeactivate,
  onDelete,
}: Props) {
  function onView(id: string): void {
    throw new Error("Function not implemented.");
  }

  function onEdit(id: string): void {
    throw new Error("Function not implemented.");
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Student
          </TableHead>

          <TableHead>
            Email
          </TableHead>

          <TableHead>
            Phone
          </TableHead>

          <TableHead>
            Branch
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {students.map(
          (
            student
          ) => (
            <TableRow
              key={
                student.id
              }
            >
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar
                    src={
                      student.profileImageUrl ??
                      ""
                    }
                    alt={`${student.firstName} ${student.lastName}`}
                    fallback={`${student.firstName[0]}${student.lastName[0]}`}
                  />

                  <div>
                    <div className="font-medium">
                      {
                        student.firstName
                      }{" "}
                      {
                        student.lastName
                      }
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {
                        student.studentCode
                      }
                    </div>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {
                  student.email
                }
              </TableCell>

              <TableCell>
                {
                  student.phone
                }
              </TableCell>

              <TableCell>
                {
                  student.branchId
                }
              </TableCell>

              <TableCell>
                <StudentStatusBadge
                  status={
                    student.status
                  }
                />
              </TableCell>

              <TableCell>
                <StudentRowActions
  student={student}
  onEdit={onEdit}
  onActivate={onActivate}
  onDeactivate={onDeactivate}
  onDelete={onDelete}
  onView={onView}
/>
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}
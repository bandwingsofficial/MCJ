"use client";

import { useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Modal } from "@/src/shared/components/ui/model";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { StudentTable } from "@/src/features/students/components/StudentTable";
import { StudentFilters } from "@/src/features/students/components/StudentFilters";
import { StudentLoading } from "@/src/features/students/components/StudentLoading";
import { StudentErrorState } from "@/src/features/students/components/StudentErrorState";
import { StudentEmptyState } from "@/src/features/students/components/StudentEmptyState";
import { StudentForm } from "@/src/features/students/components/StudentForm";

import {
  DEFAULT_STUDENT_FILTERS,
} from "@/src/features/students/constants/student.constants";

import {
  useStudents,
   useUpdateStudent,
   useCreateStudent,
} from "@/src/features/students/hooks";

import {
  studentService,
} from "@/src/features/students/services/student.service";

import type {
  CreateStudentRequest,
  Student,
  UpdateStudentRequest,
} from "@/src/features/students/types/student.types";
import router from "next/router";

export function StudentsPage() {
  const [page, setPage] =
    useState(1);

  const [filters, setFilters] =
    useState(
      DEFAULT_STUDENT_FILTERS
    );

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    selectedStudent,
    setSelectedStudent,
  ] =
    useState<Student | null>(
      null
    );

  const {
  students,
  count,
  isLoading,
  error,
  refetch,
} = useStudents({
  filters,
});
const createStudentMutation =
  useCreateStudent();

const updateStudentMutation =
  useUpdateStudent();

const totalCount =
  count;
  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalCount / 10
      )
    );

 const handleCreateStudent = async (
  values: CreateStudentRequest,
  image: File | null
) => {
  console.log("VALUES", values);

  try {
    await createStudentMutation.mutateAsync({
  payload: values,
  image,
});
    appToast.success(
      "Student created successfully."
    );

    setCreateOpen(false);

await refetch();
  } catch (error) {
    appToast.error(
      error instanceof Error
        ? error.message
        : "Failed to create student."
    );
  }
};

  const handleUpdateStudent =
async (
  values: UpdateStudentRequest,
  image: File | null
) => {
      if (!selectedStudent) {
        return;
      }

      try {
        await updateStudentMutation.mutateAsync({
  id: selectedStudent.id,
  payload: values,
  image,
});

        appToast.success(
          "Student updated successfully."
        );

        setEditOpen(false);

        setSelectedStudent(
          null
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Failed to update student."
        );
      }
    };

  const handleActivate =
    async (
      id: string
    ) => {
      try {
        await studentService.activateStudent(
          id
        );

        appToast.success(
          "Student activated successfully."
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Failed to activate student."
        );
      }
    };

  const handleDeactivate =
    async (
      id: string
    ) => {
      try {
        await studentService.deactivateStudent(
          id
        );

        appToast.success(
          "Student deactivated successfully."
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Failed to deactivate student."
        );
      }
    };

  const openDeleteDialog =
    (
      student: Student
    ) => {
      setSelectedStudent(
        student
      );

      setDeleteOpen(true);
    };

  const openEditModal =
    (
      student: Student
    ) => {
      setSelectedStudent(
        student
      );

      setEditOpen(true);
    };

  const confirmDelete =
    async () => {
      if (!selectedStudent) {
        return;
      }

      try {
        await studentService.deleteStudent(
          selectedStudent.id
        );

        appToast.success(
          "Student deleted successfully."
        );

        setDeleteOpen(false);

        setSelectedStudent(
          null
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete student."
        );
      }
    };

  if (isLoading) {
    return (
      <StudentLoading />
    );
  }

  if (error) {
    return (
      <StudentErrorState
    error={
        error ??
        "Failed to fetch students."
    }
    onRetry={() => {
        void refetch();
    }}
/>
    );
  }
    return (
    <>
      <div className="space-y-6">

        <PageHeader
          title="Students"
          description="Manage all students"
          actions={
            <Button
              onClick={() =>
                setCreateOpen(true)
              }
            >
              Add Student
            </Button>
          }
        />

        <Card className="space-y-6 p-6">

          <StudentFilters
            filters={filters}
            onChange={setFilters}
          />

          {students.length === 0 ? (
            <StudentEmptyState />
          ) : (
            <>
              <StudentTable
                students={students}
                onActivate={
                  handleActivate
                }
                onDeactivate={
                  handleDeactivate
                }
                onDelete={(id) => {
                  const student =
                    students.find(
                      (item) =>
                        item.id === id
                    );

                  if (
                    student
                  ) {
                    openDeleteDialog(
                      student
                    );
                  }
                }}
                onEdit={(id) => {
                  const student =
                    students.find(
                      (item) =>
                        item.id === id
                    );

                  if (
                    student
                  ) {
                    openEditModal(
                      student
                    );
                  }
                }}
              />

              <Pagination
                page={page}
                totalPages={
                  totalPages
                }
                onPageChange={
                  setPage
                }
              />
            </>
          )}

        </Card>

      </div>

      {/* CREATE STUDENT */}

      <Modal
        open={createOpen}
        title="Create Student"
        onClose={() =>
          setCreateOpen(false)
        }
      >
     <StudentForm
  loading={
    createStudentMutation.isPending
  }
          submitLabel="Create Student"
          onSubmit={
            handleCreateStudent
          }
        />
      </Modal>

      {/* EDIT STUDENT */}

      <Modal
        open={editOpen}
        title="Edit Student"
        onClose={() => {
          setEditOpen(false);

          setSelectedStudent(
            null
          );
        }}
      >
        {selectedStudent && (
         <StudentForm
  loading={
    updateStudentMutation.isPending
  }
            submitLabel="Update Student"
            defaultValues={{
              firstName:
                selectedStudent.firstName,

              lastName:
                selectedStudent.lastName,

              email:
                selectedStudent.email,

              phone:
                selectedStudent.phone,

              gender:
                selectedStudent.gender,

              dateOfBirth:
                selectedStudent.dateOfBirth
                  .split("T")[0],

              addressLine1:
                selectedStudent.addressLine1 ??
                "",

              addressLine2:
                selectedStudent.addressLine2 ??
                "",

              city:
                selectedStudent.city ??
                "",

              state:
                selectedStudent.state ??
                "",

              country:
                selectedStudent.country ??
                "",

              postalCode:
                selectedStudent.postalCode ??
                "",

              qualification:
                selectedStudent.qualification ??
                "",

              collegeName:
                selectedStudent.collegeName ??
                "",

              specialization:
                selectedStudent.specialization ??
                "",

              passingYear:
                selectedStudent.passingYear ??
                undefined,

              parentName:
                selectedStudent.parentName ??
                "",

              parentPhone:
                selectedStudent.parentPhone ??
                "",

              emergencyContactName:
                selectedStudent.emergencyContactName ??
                "",

              emergencyContactPhone:
                selectedStudent.emergencyContactPhone ??
                "",

              admissionDate:
                selectedStudent.admissionDate
                  .split("T")[0],

              branchId:
                selectedStudent.branchId,

              notes:
                selectedStudent.notes ??
                "",

              status:
                selectedStudent.status,
            }}
            onSubmit={
              handleUpdateStudent
            }
          />
        )}
      </Modal>

      {/* DELETE */}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Student"
        description={`Are you sure you want to delete ${
          selectedStudent?.firstName ??
          ""
        } ${
          selectedStudent?.lastName ??
          ""
        }?`}
        onConfirm={
          confirmDelete
        }
        onCancel={() => {
          setDeleteOpen(false);

          setSelectedStudent(
            null
          );
        }}
      />

    </>
  );
}
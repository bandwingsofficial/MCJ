"use client";

import { Avatar } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import {
  Student,
} from "@/src/features/students/types/student.types";

import { StudentStatusBadge } from "./StudentStatusBadge";

interface StudentDetailsProps {
  student: Student;

  onEdit?: () => void;

  onBack?: () => void;
}

interface DetailItemProps {
  label: string;

  value?: string | number | null;
}

function DetailItem({
  label,
  value,
}: DetailItemProps) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="font-medium break-words">
        {value || "-"}
      </p>
    </div>
  );
}

export function StudentDetails({
  student,
  onEdit,
  onBack,
}: StudentDetailsProps) {
  return (
    <div className="space-y-6">

      {/* Header */}

      <Card className="p-6">

        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-5">

            <Avatar
              src={
                student.profileImageUrl ??
                ""
              }
              alt={`${student.firstName} ${student.lastName}`}
              fallback={`${student.firstName[0]}${student.lastName[0]}`}
            />

            <div>

              <h2 className="text-2xl font-bold">

                {student.firstName}{" "}
                {student.lastName}

              </h2>

              <p className="text-muted-foreground">

                {student.studentCode}

              </p>

              <div className="mt-3 flex flex-wrap gap-2">

                <StudentStatusBadge
                  status={
                    student.status
                  }
                />

                <Badge
                  variant={
                    student.isActive
                      ? "success"
                      : "danger"
                  }
                >
                  {student.isActive
                    ? "Active"
                    : "Inactive"}
                </Badge>

                {student.isDeleted && (
                  <Badge variant="danger">
                    Deleted
                  </Badge>
                )}

              </div>

            </div>

          </div>

          <div className="flex gap-3">

            {onBack && (
              <Button
                variant="outline"
                onClick={onBack}
              >
                Back
              </Button>
            )}

            {onEdit && (
              <Button
                onClick={onEdit}
              >
                Edit Student
              </Button>
            )}

          </div>

        </div>

      </Card>

      {/* Personal Information */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">

          Personal Information

        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            label="Student Code"
            value={
              student.studentCode
            }
          />

          <DetailItem
            label="Email"
            value={
              student.email
            }
          />

          <DetailItem
            label="Phone"
            value={
              student.phone
            }
          />

          <DetailItem
            label="Gender"
            value={
              student.gender
            }
          />

          <DetailItem
            label="Date Of Birth"
            value={
              student.dateOfBirth.split(
                "T"
              )[0]
            }
          />

          <DetailItem
            label="Branch ID"
            value={
              student.branchId
            }
          />

        </div>

      </Card>

      {/* Academic Information */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">

          Academic Information

        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            label="Qualification"
            value={
              student.qualification
            }
          />

          <DetailItem
            label="College"
            value={
              student.collegeName
            }
          />

          <DetailItem
            label="Specialization"
            value={
              student.specialization
            }
          />

          <DetailItem
            label="Passing Year"
            value={
              student.passingYear
            }
          />

        </div>

      </Card>

            {/* Address Information */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">
          Address Information
        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            label="Address Line 1"
            value={student.addressLine1}
          />

          <DetailItem
            label="Address Line 2"
            value={student.addressLine2}
          />

          <DetailItem
            label="City"
            value={student.city}
          />

          <DetailItem
            label="State"
            value={student.state}
          />

          <DetailItem
            label="Country"
            value={student.country}
          />

          <DetailItem
            label="Postal Code"
            value={student.postalCode}
          />

        </div>

      </Card>

      {/* Parent Information */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">
          Parent Information
        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <DetailItem
            label="Parent Name"
            value={student.parentName}
          />

          <DetailItem
            label="Parent Phone"
            value={student.parentPhone}
          />

        </div>

      </Card>

      {/* Emergency Contact */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">
          Emergency Contact
        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

          <DetailItem
            label="Emergency Contact"
            value={student.emergencyContactName}
          />

          <DetailItem
            label="Emergency Phone"
            value={student.emergencyContactPhone}
          />

        </div>

      </Card>

      {/* Admission */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">
          Admission Information
        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            label="Admission Date"
            value={student.admissionDate.split("T")[0]}
          />

          <DetailItem
            label="Status"
            value={student.status}
          />

          <DetailItem
            label="Branch Id"
            value={student.branchId}
          />

        </div>

      </Card>

      {/* Notes */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">
          Notes
        </h3>

        <Separator />

        <p className="whitespace-pre-wrap leading-7">
          {student.notes || "-"}
        </p>

      </Card>

      {/* Audit */}

      <Card className="p-6 space-y-5">

        <h3 className="text-lg font-semibold">
          Audit Information
        </h3>

        <Separator />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">

          <DetailItem
            label="Created At"
            value={student.createdAt.split("T")[0]}
          />

          <DetailItem
            label="Updated At"
            value={student.updatedAt.split("T")[0]}
          />

          <DetailItem
            label="Created By"
            value={student.createdBy}
          />

          <DetailItem
            label="Updated By"
            value={student.updatedBy}
          />

          <DetailItem
            label="Deleted At"
            value={
              student.deletedAt
                ? student.deletedAt.split("T")[0]
                : "-"
            }
          />

        </div>

      </Card>

    </div>
  );
}
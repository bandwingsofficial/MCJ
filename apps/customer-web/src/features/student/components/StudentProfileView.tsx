"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Modal } from "@/src/shared/components/ui/model";

import {
  StudentProfileContact,
  StudentProfileEducation,
  StudentProfileForm,
  StudentProfileGuardian,
  StudentProfileHeader,
  StudentProfileSkeleton,
} from "@/src/features/student/components";

import { useStudentProfile } from "@/src/features/student/hooks";

export function StudentProfileView() {
  const {
    profile,
    isLoading,
    error,
    refetch,
  } = useStudentProfile();

  const [open, setOpen] =
    useState(false);

  if (isLoading) {
    return <StudentProfileSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load profile"
        description={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <StudentProfileHeader
  profile={profile}
/>
<StudentProfileContact
  profile={profile}
/>
<StudentProfileEducation
  profile={profile}
/>
<StudentProfileGuardian
  profile={profile}
/>

        <div className="absolute right-6 top-6">
          <Button
            onClick={() =>
              setOpen(true)
            }
          >
            {profile
              ? "Update Profile"
              : "Create Profile"}
          </Button>
        </div>
      </div>

      <Modal
        open={open}
        title={
          profile
            ? "Update Student Profile"
            : "Create Student Profile"
        }
        onClose={() =>
          setOpen(false)
        }
      >
        <StudentProfileForm
          onSuccess={() => {
            setOpen(false);
            void refetch();
          }}
        />
      </Modal>
    </div>
  );
}
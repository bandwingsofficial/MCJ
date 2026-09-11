"use client";

import { useState } from "react";

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
import { useStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";

export function StudentProfileView() {
  const { profile, isLoading, error, refetch } = useStudentProfile();
  const { hasStudentRecord } = useStudentPortalNavigation();
  const [open, setOpen] = useState(false);
  const isCreateModal = !profile;

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
    <>
      {/* One-off entrance animation for section cards. Move to globals.css if preferred. */}
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up {
          animation: fade-up 0.45s ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-fade-up { animation: none; }
        }
      `}</style>

      <div className="space-y-5">
        <StudentProfileHeader profile={profile} onEdit={() => setOpen(true)} />
        {hasStudentRecord ? (
          <>
            <StudentProfileContact profile={profile} />
            <StudentProfileEducation profile={profile} />
            <StudentProfileGuardian profile={profile} />
          </>
        ) : null}
      </div>

      <Modal
        open={open}
        title={
          profile ? "Update Student Profile" : "Create Student Profile"
        }
        description={
          isCreateModal
            ? "Add any student details you have available. All fields are optional."
            : undefined
        }
        layout={isCreateModal ? "scrollable" : "default"}
        preventDismiss={isCreateModal}
        showCloseButton={!isCreateModal}
        onClose={() => setOpen(false)}
      >
        <StudentProfileForm
          onCancel={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            void refetch();
          }}
        />
      </Modal>
    </>
  );
}

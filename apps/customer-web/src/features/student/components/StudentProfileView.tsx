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

export function StudentProfileView() {
  const { profile, isLoading, error, refetch } = useStudentProfile();
  const [open, setOpen] = useState(false);

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
        <StudentProfileContact profile={profile} />
        <StudentProfileEducation profile={profile} />
        <StudentProfileGuardian profile={profile} />
      </div>

      <Modal
        open={open}
        title={profile ? "Update Student Profile" : "Create Student Profile"}
        onClose={() => setOpen(false)}
      >
        <StudentProfileForm
          onSuccess={() => {
            setOpen(false);
            void refetch();
          }}
        />
      </Modal>
    </>
  );
}
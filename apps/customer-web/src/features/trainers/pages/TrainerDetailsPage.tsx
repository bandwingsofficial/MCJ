"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";

import { TrainerCoursesCard } from "@/src/features/trainers/components/TrainerCoursesCard";
import { TrainerDetailsCard } from "@/src/features/trainers/components/TrainerDetailsCard";
import { TrainerSkeleton } from "@/src/features/trainers/components/TrainerSkeleton";
import { TrainerSkillsCard } from "@/src/features/trainers/components/TrainerSkillsCard";
import { TrainerSocialLinksCard } from "@/src/features/trainers/components/TrainerSocialLinksCard";
import { useTrainer } from "@/src/features/trainers/hooks/useTrainer";

interface TrainerDetailsPageProps {
  trainerId: string;
}

export function TrainerDetailsPage({
  trainerId,
}: TrainerDetailsPageProps) {
  const {
    trainer,
    isLoading,
    error,
    refetch,
  } = useTrainer(
    trainerId,
  );

  if (isLoading) {
    return <TrainerSkeleton count={1} />;
  }

  if (error || !trainer) {
    return (
      <ErrorState
        title="Failed to Load Trainer"
        description={
          error ??
          "Trainer not found."
        }
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${trainer.firstName} ${trainer.lastName}`}
        description="Trainer Details"
      />

      <TrainerDetailsCard
        trainer={trainer}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <TrainerSkillsCard
          skills={trainer.skills}
        />

        <TrainerCoursesCard
          courses={trainer.courses}
        />
      </div>

      <TrainerSocialLinksCard
        linkedInUrl={
          trainer.linkedInUrl
        }
        youtubeUrl={
          trainer.youtubeUrl
        }
        instagramUrl={
          trainer.instagramUrl
        }
      />
    </div>
  );
}
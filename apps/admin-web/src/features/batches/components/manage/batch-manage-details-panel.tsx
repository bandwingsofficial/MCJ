"use client";

import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { UserRound } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Loader } from "@/src/shared/components/ui/loader";

import { BatchStatusBadge } from "@/src/features/batches/components/BatchStatusBadge";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { formatBatchMode } from "@/src/features/batches/utils/batch.helper";
import { categoryService } from "@/src/features/categories/services/category.service";
import { useCourse } from "@/src/features/courses/hooks/use-course";
import { useCourseTrainers } from "@/src/features/courses/hooks/use-course-trainers";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";
import { getTrainerDisplayStatus } from "@/src/features/trainers/utils/trainer-display.utils";

interface Props {
  batch: Batch;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-sm font-semibold text-[#102A56]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-[#647A9B]">
      {message}
    </p>
  );
}

function formatTrainerName(
  trainer: Pick<TrainerDetails, "firstName" | "lastName">,
) {
  return [trainer.firstName, trainer.lastName].filter(Boolean).join(" ") || "—";
}

function TrainerCard({ trainer }: { trainer: TrainerDetails }) {
  const name = formatTrainerName(trainer);

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-start">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-slate-100">
        {trainer.profileImageUrl ? (
          <Image
            src={trainer.profileImageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-400">
            <UserRound className="h-6 w-6" />
          </div>
        )}
      </div>

      <dl className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
        <DetailField label="Trainer Name" value={name} />
        <DetailField
          label="Trainer Code"
          value={trainer.employeeCode?.trim() || "—"}
        />
        <DetailField
          label="Qualification"
          value={trainer.qualification?.trim() || "—"}
        />
        <DetailField
          label="Specialization"
          value={trainer.specialization?.trim() || "—"}
        />
        <div className="sm:col-span-2">
          <DetailField
            label="Status"
            value={
              <TrainerStatusBadge status={getTrainerDisplayStatus(trainer)} />
            }
          />
        </div>
      </dl>
    </article>
  );
}

export function BatchManageDetailsPanel({ batch }: Props) {
  const courseId = batch.courseId?.trim() || batch.course?.id || "";
  const { course, isLoading: courseLoading } = useCourse(courseId);
  const {
    trainers,
    isLoading: trainersLoading,
  } = useCourseTrainers(courseId || undefined);

  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categoryLoading, setCategoryLoading] = useState(false);

  const categoryId = course?.categoryId || course?.category?.id || null;
  const categoryName =
    course?.category?.name?.trim() ||
    course?.categoryName?.trim() ||
    batch.course?.category?.name?.trim() ||
    batch.category?.name?.trim() ||
    "";

  useEffect(() => {
    if (!categoryId) {
      setCategorySlug(null);
      return;
    }

    let cancelled = false;

    const loadCategory = async () => {
      try {
        setCategoryLoading(true);
        const response = await categoryService.getCategory(categoryId);
        if (!cancelled) {
          setCategorySlug(response.data.slug?.trim() || null);
        }
      } catch {
        if (!cancelled) {
          setCategorySlug(null);
        }
      } finally {
        if (!cancelled) {
          setCategoryLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  const isArchived = Boolean(batch.deletedAt || batch.isDeleted);
  const courseTitle =
    course?.title?.trim() || batch.course?.title?.trim() || "";
  const courseCode =
    course?.code?.trim() || batch.course?.code?.trim() || "";
  const courseDescription =
    course?.shortDescription?.trim() ||
    course?.description?.trim() ||
    batch.course?.shortDescription?.trim() ||
    batch.course?.description?.trim() ||
    "";

  return (
    <div className="space-y-4">
      <SectionCard title="Batch Details">
        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <DetailField label="Batch Name" value={batch.name} />
          <DetailField label="Batch Code" value={batch.code} />
          <DetailField
            label="Batch Type"
            value={formatBatchMode(batch.mode)}
          />
          <DetailField
            label="Status"
            value={
              <BatchStatusBadge
                status={batch.status}
                isActive={batch.isActive}
                isDeleted={isArchived}
              />
            }
          />
        </dl>
      </SectionCard>

      <SectionCard title="Course Details">
        {!courseId ? (
          <EmptyMessage message="No course assigned" />
        ) : courseLoading && !course && !batch.course ? (
          <div className="py-6">
            <Loader />
          </div>
        ) : (
          <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
            <DetailField
              label="Course Name"
              value={courseTitle || "—"}
            />
            <DetailField
              label="Course Code"
              value={courseCode || "—"}
            />
            <div className="sm:col-span-2">
              <DetailField
                label="Description"
                value={courseDescription || "—"}
              />
            </div>
          </dl>
        )}
      </SectionCard>

      <SectionCard title="Category Details">
        {!courseId ? (
          <EmptyMessage message="No course assigned" />
        ) : courseLoading && !categoryName ? (
          <div className="py-6">
            <Loader />
          </div>
        ) : !categoryName && !categoryId ? (
          <EmptyMessage message="No category available" />
        ) : (
          <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
            <DetailField
              label="Category Name"
              value={categoryName || "—"}
            />
            <DetailField
              label="Category Code"
              value={
                categoryLoading
                  ? "…"
                  : categorySlug || "—"
              }
            />
          </dl>
        )}
      </SectionCard>

      <SectionCard title="Trainer Details">
        {!courseId ? (
          <EmptyMessage message="Not yet assigned" />
        ) : trainersLoading ? (
          <div className="py-6">
            <Loader />
          </div>
        ) : trainers.length === 0 ? (
          <EmptyMessage message="Not yet assigned" />
        ) : (
          <div className="space-y-3">
            {trainers.map((trainer) => (
              <TrainerCard key={trainer.id} trainer={trainer} />
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

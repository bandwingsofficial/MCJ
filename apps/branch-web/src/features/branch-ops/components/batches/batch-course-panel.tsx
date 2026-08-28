"use client";

import { FileText, Link2, PlayCircle } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { trainerNames } from "@/src/features/branch-ops/utils/batch-display";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface Props {
  batchId: string;
}

function resourceIcon(type: string) {
  if (type === "VIDEO") return PlayCircle;
  if (type === "LINK") return Link2;
  return FileText;
}

export function BatchCoursePanel({ batchId }: Props) {
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batchCourse(batchId),
    [batchId],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data?.courses.length) {
    return <EmptyState title="No course has been assigned to this batch." />;
  }

  return (
    <div className="space-y-4">
      {data.courses.map((course) => (
        <section
          key={course.id}
          className="rounded-2xl border border-[#E1EBF5] bg-white p-5"
        >
          <h2 className="text-lg font-semibold text-[#102A56]">{course.title}</h2>
          <p className="mt-0.5 font-mono text-sm text-[#647A9B]">{course.code}</p>
          {course.category?.name ? (
            <p className="mt-1 text-sm text-[#647A9B]">
              Category: {course.category.name}
            </p>
          ) : null}
          {course.duration ? (
            <p className="mt-1 text-sm text-[#647A9B]">Duration: {course.duration}</p>
          ) : null}
          {course.description ? (
            <p className="mt-3 text-sm leading-6 text-[#334155]">{course.description}</p>
          ) : null}
        </section>
      ))}

      <section className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
        <h2 className="text-sm font-semibold text-[#102A56]">Trainer</h2>
        {!data.trainers.length ? (
          <p className="mt-3 text-sm text-[#647A9B]">No trainer assigned to this batch.</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {data.trainers.map((trainer) => (
              <div
                key={trainer.id}
                className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4"
              >
                <div className="flex items-start gap-3">
                  {trainer.profileImageUrl ? (
                    <img
                      src={trainer.profileImageUrl}
                      alt=""
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <p className="font-medium text-[#102A56]">
                      {trainerNames([trainer]) || "Not assigned"}
                    </p>
                {trainer.qualification ? (
                  <p className="mt-1 text-sm text-[#647A9B]">{trainer.qualification}</p>
                ) : null}
                {trainer.specialization ? (
                  <p className="text-sm text-[#647A9B]">{trainer.specialization}</p>
                ) : null}
                {trainer.experienceYears != null ? (
                  <p className="text-sm text-[#647A9B]">
                    {trainer.experienceYears} year
                    {trainer.experienceYears === 1 ? "" : "s"} experience
                  </p>
                ) : null}
                {trainer.bio ? (
                  <p className="mt-2 text-sm leading-6 text-[#334155]">{trainer.bio}</p>
                ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-[#102A56]">Course modules</h2>
        {!data.modules.length ? (
          <EmptyState title="No modules are available for this course." />
        ) : (
          data.modules.map((module, index) => (
            <article
              key={module.id}
              className="rounded-2xl border border-[#E1EBF5] bg-white p-5"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
                Module {index + 1}
              </p>
              <h3 className="mt-1 text-base font-semibold text-[#102A56]">
                {module.name}
              </h3>
              {module.description ? (
                <p className="mt-1 text-sm text-[#647A9B]">{module.description}</p>
              ) : null}

              {!module.lessons.length ? (
                <p className="mt-3 text-sm text-[#647A9B]">No lessons in this module.</p>
              ) : (
                <ul className="mt-4 space-y-3">
                  {module.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="rounded-xl border border-[#E8F0F8] bg-[#FBFDFF] p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-[#102A56]">
                            {lesson.order + 1}. {lesson.name}
                          </p>
                          {lesson.description ? (
                            <p className="mt-1 text-sm text-[#647A9B]">
                              {lesson.description}
                            </p>
                          ) : null}
                        </div>
                        {lesson.duration != null ? (
                          <span className="text-xs text-[#647A9B]">
                            {lesson.duration} min
                          </span>
                        ) : null}
                      </div>

                      {!lesson.resources.length ? (
                        <p className="mt-2 text-xs text-[#94A3B8]">
                          No resources are available.
                        </p>
                      ) : (
                        <ul className="mt-3 space-y-1.5">
                          {lesson.resources.map((resource) => {
                            const Icon = resourceIcon(resource.type);
                            const content = (
                              <span className="inline-flex items-center gap-2 text-sm text-[#2563EB]">
                                <Icon className="h-4 w-4" />
                                {resource.title}
                                <span className="text-xs text-[#647A9B]">
                                  {resource.type}
                                </span>
                              </span>
                            );

                            return (
                              <li key={resource.id}>
                                {resource.url ? (
                                  <a
                                    href={resource.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="hover:underline"
                                  >
                                    {content}
                                  </a>
                                ) : (
                                  content
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))
        )}
      </section>

      {data.materials.length ? (
        <section className="rounded-2xl border border-[#E1EBF5] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#102A56]">
            Course resources
          </h2>
          <ul className="mt-3 space-y-2">
            {data.materials.map((material) => {
              const Icon = resourceIcon(material.type);
              return (
                <li key={material.id}>
                  {material.url ? (
                    <a
                      href={material.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#2563EB] hover:underline"
                    >
                      <Icon className="h-4 w-4" />
                      {material.title}
                      <span className="text-xs text-[#647A9B]">{material.type}</span>
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-sm text-[#102A56]">
                      <Icon className="h-4 w-4" />
                      {material.title}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

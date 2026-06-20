"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Drawer } from "@/src/shared/components/ui/drawer";
import { Separator } from "@/src/shared/components/ui/separator";

import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";
import { JobInfoItem } from "@/src/features/jobs/components/JobInfoItem";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobViewDrawerProps {
  open: boolean;

  job?: Job;

  onClose: () => void;
}

export function JobViewDrawer({
  open,
  job,
  onClose,
}: JobViewDrawerProps) {
  if (!job) {
    return null;
  }

  return (
    <Drawer
      open={open}
      title="Job Details"
      onClose={onClose}
    >
      <div className="space-y-6 pb-8">

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Basic Information
          </h2>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <JobInfoItem
              label="Title"
              value={job.title}
            />

            <JobInfoItem
              label="Company"
              value={job.companyName}
            />

            <JobInfoItem
              label="Slug"
              value={job.slug}
            />

            <JobInfoItem
              label="Employment"
              value={job.employmentType.replaceAll(
                "_",
                " ",
              )}
            />

            <JobInfoItem
              label="Working Days"
              value={job.workingDays.replaceAll(
                "_",
                " ",
              )}
            />

            <JobInfoItem
              label="Status"
              value={
                <JobStatusBadge
                  status={job.status}
                  isActive={job.isActive}
                />
              }
            />

            <JobInfoItem
              label="Vacancies"
              value={job.vacancies}
            />

            <JobInfoItem
              label="Remote"
              value={
                job.isRemote
                  ? "Yes"
                  : "No"
              }
            />
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Company
          </h2>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <JobInfoItem
              label="Website"
              value={
                job.companyWebsite ??
                "-"
              }
            />

            <JobInfoItem
              label="Logo"
              value={
                job.companyLogo ??
                "-"
              }
            />

            <div className="md:col-span-2">
              <JobInfoItem
                label="Company Description"
                value={
                  job.companyDescription ??
                  "-"
                }
              />
            </div>
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Location
          </h2>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <JobInfoItem
              label="Country"
              value={job.country}
            />

            <JobInfoItem
              label="State"
              value={job.state}
            />

            <JobInfoItem
              label="City"
              value={job.city}
            />

            <JobInfoItem
              label="Location"
              value={job.location}
            />
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Salary & Experience
          </h2>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <JobInfoItem
              label="Experience"
              value={`${job.minExperience} - ${job.maxExperience} Years`}
            />

            <JobInfoItem
              label="Salary"
              value={`${job.salaryCurrency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`}
            />

            <JobInfoItem
              label="Deadline"
              value={new Date(
                job.applicationDeadline,
              ).toLocaleDateString()}
            />

            <JobInfoItem
              label="Eligibility"
              value={
                job.eligibilityTitle
              }
            />
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Description
          </h2>

          <Separator />

          <JobInfoItem
            label="Short Description"
            value={
              job.shortDescription ??
              "-"
            }
          />

          <Separator />

          <JobInfoItem
            label="Description"
            value={job.description}
          />
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Responsibilities
          </h2>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {job.responsibilities.map(
              (
                responsibility,
              ) => (
                <Badge
                  key={
                    responsibility
                  }
                >
                  {
                    responsibility
                  }
                </Badge>
              ),
            )}
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Skills
          </h2>

          <Separator />

          <div className="flex flex-wrap gap-2">
            {job.skills.map(
              (skill) => (
                <Badge key={skill}>
                  {skill}
                </Badge>
              ),
            )}
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Interview Process
          </h2>

          <Separator />

          <div className="space-y-4">
            {job.interviewProcess.map(
              (
                process,
                index,
              ) => (
                <Card
                  key={index}
                  className="p-4"
                >
                  <p className="font-semibold">
                    {process.title}
                  </p>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {
                      process.description
                    }
                  </p>
                </Card>
              ),
            )}
          </div>
        </Card>

        <Card className="space-y-5 p-5">
          <h2 className="text-lg font-semibold">
            Audit
          </h2>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            <JobInfoItem
              label="Created At"
              value={new Date(
                job.createdAt,
              ).toLocaleString()}
            />

            <JobInfoItem
              label="Updated At"
              value={new Date(
                job.updatedAt,
              ).toLocaleString()}
            />

            <JobInfoItem
              label="Deleted"
              value={
                job.isDeleted
                  ? "Yes"
                  : "No"
              }
            />

            <JobInfoItem
              label="Deleted At"
              value={
                job.deletedAt
                  ? new Date(
                      job.deletedAt,
                    ).toLocaleString()
                  : "-"
              }
            />
          </div>
        </Card>
      </div>
    </Drawer>
  );
}
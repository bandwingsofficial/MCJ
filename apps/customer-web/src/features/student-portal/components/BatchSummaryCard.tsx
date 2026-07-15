"use client";

import {
  Calendar,
  Clock3,
  GraduationCap,
  Laptop,
  MapPin,
  Users,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  StudentPortalBatch,
  StudentPortalTrainer,
} from "@/src/features/student-portal/types/student-portal.types";

interface BatchSummaryCardProps {
  batch: StudentPortalBatch;

  trainers: StudentPortalTrainer[];
}

export function BatchSummaryCard({
  batch,
  trainers,
}: BatchSummaryCardProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center gap-3">
        <GraduationCap className="h-6 w-6 text-primary" />

        <div>
          <h3 className="text-lg font-semibold">
            Batch Information
          </h3>

          <p className="text-sm text-muted-foreground">
            Course schedule and trainer details
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase text-muted-foreground">
            Batch Name
          </p>

          <p className="mt-1 font-semibold">
            {batch.name}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">
            Batch Code
          </p>

          <p className="mt-1 font-semibold">
            {batch.code}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Laptop className="h-4 w-4 text-primary" />

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Mode
            </p>

            <Badge>
              {batch.mode}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Classroom
            </p>

            <p className="font-medium">
              {batch.classroom ??
                "--"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Start Date
            </p>

            <p className="font-medium">
              {new Date(
                batch.startDate,
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              End Date
            </p>

            <p className="font-medium">
              {new Date(
                batch.endDate,
              ).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Clock3 className="h-4 w-4 text-primary" />

          <div>
            <p className="text-xs uppercase text-muted-foreground">
              Class Time
            </p>

            <p className="font-medium">
              {batch.startTime} -{" "}
              {batch.endTime}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase text-muted-foreground">
            Meeting Link
          </p>

          {batch.meetingLink ? (
            <a
              href={
                batch.meetingLink
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-primary underline"
            >
              Join Online Class
            </a>
          ) : (
            <p className="font-medium">
              --
            </p>
          )}
        </div>
      </div>

      {trainers.length >
        0 && (
        <>
          <div className="my-6 border-t" />

          <div className="mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />

            <h4 className="font-semibold">
              Trainers
            </h4>
          </div>

          <div className="space-y-4">
            {trainers.map(
              (
                trainer,
              ) => (
                <div
                  key={
                    trainer.id
                  }
                  className="rounded-lg border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-semibold">
                        {
                          trainer.firstName
                        }{" "}
                        {
                          trainer.lastName
                        }
                      </h5>

                      <p className="text-sm text-muted-foreground">
                        {
                          trainer.specialization
                        }
                      </p>
                    </div>

                    <Badge variant="info">
                      {
                        trainer.employeeCode
                      }
                    </Badge>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p>
                      {
                        trainer.email
                      }
                    </p>

                    <p>
                      {
                        trainer.phone
                      }
                    </p>
                  </div>
                </div>
              ),
            )}
          </div>
        </>
      )}
    </Card>
  );
}
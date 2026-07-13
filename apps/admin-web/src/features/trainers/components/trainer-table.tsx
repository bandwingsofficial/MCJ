"use client";

import Image from "next/image";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { Avatar } from "@/src/shared/components/ui/avatar";

import type {
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

import { TrainerStatusBadge } from "./trainer-status-badge";

import { TrainerActions } from "./trainer-actions";

interface Props {
  trainers: TrainerListItem[];

  onEdit: (
    trainer: TrainerListItem
  ) => void;

  onDelete: (
    trainer: TrainerListItem
  ) => void;

  onRestore: (
    trainer: TrainerListItem
  ) => void;

  onActivate: (
    trainer: TrainerListItem
  ) => void;

  onDeactivate: (
    trainer: TrainerListItem
  ) => void;

  onPermanentDelete: (
    trainer: TrainerListItem
  ) => void;
}

export function TrainerTable({
  trainers,
  onEdit,
  onDelete,
  onRestore,
  onActivate,
  onDeactivate,
  onPermanentDelete,
}: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Image
          </TableHead>

          <TableHead>
            Trainer
          </TableHead>

          <TableHead>
            Email
          </TableHead>

          <TableHead>
            Phone
          </TableHead>

          <TableHead>
            Type
          </TableHead>

          <TableHead>
            Rating
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {trainers.map(
          (trainer) => (
            <TableRow
              key={
                trainer.id
              }
            >
              <TableCell>
                {trainer.profileImageUrl ? (
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-md border bg-white">
                    <Image
                      src={
                        trainer.profileImageUrl
                      }
                      alt={
                        trainer.firstName
                      }
                      width={64}
                      height={64}
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                    No Image
                  </div>
                )}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium">
                      {
                        trainer.firstName
                      }{" "}
                      {
                        trainer.lastName
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {
                        trainer.employeeCode
                      }
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {
                  trainer.email
                }
              </TableCell>

              <TableCell>
                {
                  trainer.phone
                }
              </TableCell>

              <TableCell>
                {trainer.trainerType.replaceAll(
                  "_",
                  " "
                )}
              </TableCell>

              <TableCell>
                {
                  trainer.averageRating
                }
              </TableCell>

              <TableCell>
                <TrainerStatusBadge
                  status={
                    trainer.status
                  }
                />
              </TableCell>

              <TableCell>
                <TrainerActions
                  status={
                    trainer.status
                  }
                  isDeleted={
                    trainer.isDeleted
                  }
                  onEdit={() =>
                    onEdit(
                      trainer
                    )
                  }
                  onDelete={() =>
                    onDelete(
                      trainer
                    )
                  }
                  onRestore={() =>
                    onRestore(
                      trainer
                    )
                  }
                  onActivate={() =>
                    onActivate(
                      trainer
                    )
                  }
                  onDeactivate={() =>
                    onDeactivate(
                      trainer
                    )
                  }
                  onPermanentDelete={() =>
                    onPermanentDelete(
                      trainer
                    )
                  }
                />
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}
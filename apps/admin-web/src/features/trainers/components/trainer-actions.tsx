"use client";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import { Button } from "@/src/shared/components/ui/button";

interface Props {
  onEdit: () => void;

  onActivate: () => void;

  onDeactivate: () => void;

  onDelete: () => void;

  onRestore: () => void;

  isDeleted: boolean;

  status: string;
}

export function TrainerActions({
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onRestore,
  isDeleted,
  status,
}: Props) {
  return (
    <Dropdown
      trigger={
        <Button
          variant="outline"
        >
          Actions
        </Button>
      }
      items={[
        {
          label:
            "Edit",
          onClick:
            onEdit,
        },

        ...(!isDeleted
          ? [
              {
                label:
                  status ===
                  "ACTIVE"
                    ? "Deactivate"
                    : "Activate",

                onClick:
                  status ===
                  "ACTIVE"
                    ? onDeactivate
                    : onActivate,
              },
            ]
          : []),

        ...(!isDeleted
          ? [
              {
                label:
                  "Delete",

                onClick:
                  onDelete,
              },
            ]
          : []),

        ...(isDeleted
          ? [
              {
                label:
                  "Restore",

                onClick:
                  onRestore,
              },
            ]
          : []),
      ]}
    />
  );
}
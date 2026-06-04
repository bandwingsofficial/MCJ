"use client";

import { MoreVertical } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

interface Props {
  isActive: boolean;

  isDeleted?: boolean;

  onEdit: () => void;

  onActivate: () => void;

  onDeactivate: () => void;

  onResetPassword: () => void;

  onDelete: () => void;

  onRestore: () => void;
}

export const BranchUserActions = ({
  isActive,
  isDeleted = false,
  onEdit,
  onActivate,
  onDeactivate,
  onResetPassword,
  onDelete,
  onRestore,
}: Props) => {
  if (isDeleted) {
    return (
      <Dropdown
        trigger={
          <Button variant="outline">
            <MoreVertical
              size={18}
            />
          </Button>
        }
        items={[
          {
            label: "Restore",
            onClick: onRestore,
          },
        ]}
      />
    );
  }

  return (
    <Dropdown
      trigger={
        <Button variant="outline">
          <MoreVertical
            size={18}
          />
        </Button>
      }
      items={[
        {
          label: "Edit",
          onClick: onEdit,
        },

        isActive
          ? {
              label:
                "Deactivate",
              onClick:
                onDeactivate,
            }
          : {
              label:
                "Activate",
              onClick:
                onActivate,
            },

        {
          label:
            "Reset Password",
          onClick:
            onResetPassword,
        },

        {
          label: "Delete",
          onClick: onDelete,
        },
      ]}
    />
  );
};
"use client";

import { useEffect, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

interface CourseModuleMoveDialogProps {
  open: boolean;

  loading?: boolean;

  currentPosition: number;

  onClose: () => void;

  onSubmit: (
    newPosition: number
  ) => void;
}

export function CourseModuleMoveDialog({
  open,
  loading = false,
  currentPosition,
  onClose,
  onSubmit,
}: CourseModuleMoveDialogProps) {
  const [
    newPosition,
    setNewPosition,
  ] = useState(
    currentPosition
  );

  useEffect(() => {
    setNewPosition(
      currentPosition
    );
  }, [currentPosition]);

  const handleSubmit = () => {
    onSubmit(newPosition);
  };

  return (
    <Modal
      open={open}
      title="Move Module"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          <Label required>
            New Position
          </Label>

          <Input
            type="number"
            min={1}
            value={String(
              newPosition
            )}
            onChange={(e) =>
              setNewPosition(
                Number(
                  e.target.value
                )
              )
            }
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            loading={loading}
            onClick={
              handleSubmit
            }
          >
            Move Module
          </Button>
        </div>
      </div>
    </Modal>
  );
}
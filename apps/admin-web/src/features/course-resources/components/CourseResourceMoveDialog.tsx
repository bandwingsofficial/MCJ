"use client";

import {
  useEffect,
  useState,
} from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";

interface CourseResourceMoveDialogProps {
  open: boolean;

  loading?: boolean;

  currentPosition: number;

  onClose: () => void;

  onMove: (
    newPosition: number,
  ) => Promise<void>;
}

export function CourseResourceMoveDialog({
  open,
  loading,
  currentPosition,
  onClose,
  onMove,
}: CourseResourceMoveDialogProps) {
  const [
    newPosition,
    setNewPosition,
  ] = useState(
    currentPosition,
  );

  useEffect(() => {
    if (open) {
      setNewPosition(
        currentPosition,
      );
    }
  }, [
    currentPosition,
    open,
  ]);

  return (
    <Modal
      open={open}
      title="Move Resource"
      onClose={onClose}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label required>
            New Position
          </Label>

          <Input
            type="number"
            min={1}
            value={String(
              newPosition,
            )}
            onChange={(e) =>
              setNewPosition(
                Number(
                  e.target.value,
                ),
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
            onClick={() =>
              void onMove(
                newPosition,
              )
            }
          >
            Move
          </Button>
        </div>
      </div>
    </Modal>
  );
}
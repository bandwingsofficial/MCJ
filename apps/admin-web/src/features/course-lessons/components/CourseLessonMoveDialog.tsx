"use client";

import {
  useEffect,
  useState,
} from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { Modal } from "@/src/shared/components/ui/model";

interface CourseLessonMoveDialogProps {
  open: boolean;

  currentPosition: number;

  loading: boolean;

  onClose: () => void;

  onMove: (
    newPosition: number,
  ) => void;
}

export function CourseLessonMoveDialog({
  open,
  currentPosition,
  loading,
  onClose,
  onMove,
}: CourseLessonMoveDialogProps) {
  const [
    position,
    setPosition,
  ] = useState("");

  useEffect(() => {
    if (open) {
      setPosition(
        String(
          currentPosition,
        ),
      );
    }
  }, [
    open,
    currentPosition,
  ]);

  const handleMove = () => {
    const value =
      Number(position);

    if (
      Number.isNaN(value) ||
      value < 1
    ) {
      return;
    }

    onMove(value);
  };

  return (
    <Modal
      open={open}
      title="Move Lesson"
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
            value={position}
            onChange={(event) =>
              setPosition(
                event.target.value,
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
              handleMove
            }
          >
            Move Lesson
          </Button>
        </div>
      </div>
    </Modal>
  );
}
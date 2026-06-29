"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  useBlockComment,
  useUnblockComment,
} from "@/src/features/community/hooks";

interface BlockCommentDialogProps {
  open: boolean;

  commentId: string | null;

  isBlocked: boolean;

  onClose: () => void;
}

export function BlockCommentDialog({
  open,
  commentId,
  isBlocked,
  onClose,
}: BlockCommentDialogProps) {
  const blockMutation =
    useBlockComment();

  const unblockMutation =
    useUnblockComment();

  const handleConfirm =
    async () => {
      if (!commentId) {
        return;
      }

      if (isBlocked) {
        await appToast.promise(
          unblockMutation.mutateAsync(
            commentId,
          ),
          {
            loading:
              "Unblocking comment...",

            success:
              "Comment unblocked successfully.",

            error:
              "Failed to unblock comment.",
          },
        );
      } else {
        await appToast.promise(
          blockMutation.mutateAsync(
            commentId,
          ),
          {
            loading:
              "Blocking comment...",

            success:
              "Comment blocked successfully.",

            error:
              "Failed to block comment.",
          },
        );
      }

      onClose();
    };

  return (
    <ConfirmDialog
      open={open}
      title={
        isBlocked
          ? "Unblock Comment"
          : "Block Comment"
      }
      description={
        isBlocked
          ? "Do you want to unblock this comment?"
          : "Do you want to block this comment?"
      }
      onConfirm={
        handleConfirm
      }
      onCancel={onClose}
    />
  );
}
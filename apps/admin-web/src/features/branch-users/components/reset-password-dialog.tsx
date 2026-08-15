"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";

import { Button } from "@/src/shared/components/ui/button";

import { Input } from "@/src/shared/components/ui/input";

import { Label } from "@/src/shared/components/ui/label";

import { FormError } from "@/src/shared/components/ui/form-error";

import { useResetPassword } from "@/src/features/branch-users/hooks/use-reset-password";

interface Props {
  open: boolean;

  userId: string;

  onClose: () => void;

  onSuccess: () => void;
}

export function ResetPasswordDialog({
  open,
  userId,
  onClose,
  onSuccess,
}: Props) {
  const {
    resetPassword,
    isLoading,
  } = useResetPassword();

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [error, setError] =
    useState("");

  const handleReset =
    async () => {
      setError("");

      if (
        newPassword.length < 8
      ) {
        setError(
          "Password must be at least 8 characters"
        );
        return;
      }

      if (
        newPassword !==
        confirmPassword
      ) {
        setError(
          "Passwords do not match"
        );
        return;
      }

      const success =
        await resetPassword(
          userId,
          newPassword
        );

      if (!success) {
        return;
      }

      setNewPassword("");
      setConfirmPassword("");

      onSuccess();

      onClose();
    };

  return (
    <Modal
      open={open}
      title="Reset Password"
      onClose={onClose}
    >
      <div className="space-y-5">
        <div>
          <Label required>
            New Password
          </Label>

          <Input
            type="password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
            placeholder="Enter new password"
          />
        </div>

        <div>
          <Label required>
            Confirm Password
          </Label>

          <Input
            type="password"
            value={
              confirmPassword
            }
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
            placeholder="Confirm password"
          />
        </div>

        <FormError
          message={error}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            type="button"
            loading={isLoading}
            disabled={isLoading}
            onClick={
              handleReset
            }
          >
            Reset Password
          </Button>
        </div>
      </div>
    </Modal>
  );
}

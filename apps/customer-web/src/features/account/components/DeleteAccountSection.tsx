"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { accountService } from "@/src/features/account/services/account.service";
import { useLogout } from "@/src/features/auth/hooks/use-logout";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export function DeleteAccountSection() {
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");

  const deleteMutation = useMutation({
    mutationFn: () => accountService.deletePermanently(confirmation.trim()),
    onSuccess: () => {
      toast.success("Your account has been deleted");
      setOpen(false);
      logout.mutate();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error) || "Could not delete account");
    },
  });

  const canConfirm = confirmation.trim().toUpperCase() === "DELETE";

  return (
    <section className="animate-fade-up rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-[#102A56]">Delete account</h2>
      <p className="mt-2 text-sm text-[#647A9B]">
        Permanently remove your portal account. Referral and wallet history may
        be retained for audit. This cannot be undone.
      </p>
      <Button
        type="button"
        variant="danger"
        className="mt-4"
        onClick={() => {
          setConfirmation("");
          setOpen(true);
        }}
      >
        Delete account
      </Button>

      <Modal
        open={open}
        title="Delete your account permanently?"
        description="This action cannot be undone. Type DELETE to confirm."
        onClose={() => {
          if (!deleteMutation.isPending) setOpen(false);
        }}
      >
        <div className="space-y-4">
          <Input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            placeholder="Type DELETE"
            autoComplete="off"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={deleteMutation.isPending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={!canConfirm || deleteMutation.isPending}
              loading={deleteMutation.isPending}
              onClick={() => deleteMutation.mutate()}
            >
              Delete permanently
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

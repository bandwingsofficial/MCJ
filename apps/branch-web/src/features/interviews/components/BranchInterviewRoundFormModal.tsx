"use client";

import { useEffect, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type {
  InterviewRoundItem,
  InterviewRoundStatus,
} from "@/src/features/branch-ops/types";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/lib/toast";

interface Props {
  open: boolean;
  round: InterviewRoundItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BranchInterviewRoundFormModal({
  open,
  round,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(round);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("1");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<InterviewRoundStatus>("ACTIVE");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (round) {
      setName(round.name);
      setSortOrder(String(round.sortOrder));
      setDescription(round.description ?? "");
      setStatus(round.status);
      return;
    }
    setName("");
    setSortOrder("1");
    setDescription("");
    setStatus("ACTIVE");
  }, [open, round]);

  const canSubmit =
    Boolean(name.trim()) &&
    Number.isFinite(Number(sortOrder)) &&
    Number(sortOrder) >= 1 &&
    !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      sortOrder: Math.trunc(Number(sortOrder)),
      description: description.trim() || undefined,
      status,
    };

    try {
      setSubmitting(true);
      if (round) {
        await branchOpsApi.updateInterviewRound(round.id, {
          ...payload,
          description: description.trim() || null,
        });
        appToast.success("Interview round updated");
      } else {
        await branchOpsApi.createInterviewRound(payload);
        appToast.success("Interview round created");
      }
      onSuccess();
      onClose();
    } catch (error) {
      appToast.error(userFacingApiMessage(parseBranchOpsError(error)));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Interview Round" : "Create Interview Round"}
      description="Configure round name, order, and status"
      onClose={onClose}
      contentClassName="!max-w-[520px]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={!canSubmit}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isEdit ? "Save Changes" : "Create Round"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#647A9B]">
            Round Name
          </label>
          <Input
            value={name}
            disabled={submitting}
            maxLength={120}
            placeholder="e.g. Screening"
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">Order</label>
            <Input
              type="number"
              min={1}
              value={sortOrder}
              disabled={submitting}
              onChange={(event) => setSortOrder(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[#647A9B]">Status</label>
            <AppSelect
              value={status}
              disabled={submitting}
              options={[
                { label: "Active", value: "ACTIVE" },
                { label: "Inactive", value: "INACTIVE" },
              ]}
              onValueChange={(value) =>
                setStatus(value as InterviewRoundStatus)
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[#647A9B]">
            Description (optional)
          </label>
          <Textarea
            value={description}
            disabled={submitting}
            maxLength={500}
            className="min-h-20"
            placeholder="Short description of this round..."
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
      </div>
    </Modal>
  );
}

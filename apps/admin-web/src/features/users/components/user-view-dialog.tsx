"use client";

import { useEffect, useState } from "react";

import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";

import { adminUsersService } from "@/src/features/users/services/admin-users.service";
import type { AdminUserListItem } from "@/src/features/users/services/admin-users.service";
import type { AdminUserDetailPayload } from "@/src/features/users/types/user-detail.types";

import { UserDetailsContent } from "./user-details-content";

interface UserViewDialogProps {
  open: boolean;
  user: AdminUserListItem | null;
  onClose: () => void;
}

export function UserViewDialog({ open, user, onClose }: UserViewDialogProps) {
  const [payload, setPayload] = useState<AdminUserDetailPayload | null>(null);
  const [transactions, setTransactions] = useState<Array<Record<string, unknown>>>(
    [],
  );
  const [redemptions, setRedemptions] = useState<Array<Record<string, unknown>>>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user?.id) {
      setPayload(null);
      setTransactions([]);
      setRedemptions([]);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const [detail, tx, red] = await Promise.all([
          adminUsersService.getById(user.id),
          adminUsersService.listCoinTransactions(user.id, { take: 50 }),
          adminUsersService.listRedemptions(user.id),
        ]);
        if (!cancelled) {
          setPayload(detail as unknown as AdminUserDetailPayload);
          setTransactions(tx.items ?? []);
          setRedemptions(red.items ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error ? err.message : "Unable to load user details.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, user?.id]);

  return (
    <Modal
      open={open}
      title={user ? user.name : "User details"}
      onClose={onClose}
      contentClassName="max-w-3xl"
      bodyClassName="max-h-[min(70vh,640px)] overflow-y-auto"
    >
      {isLoading ? (
        <div className="flex min-h-[200px] items-center justify-center">
          <Loader />
        </div>
      ) : loadError ? (
        <p className="text-sm text-red-600">{loadError}</p>
      ) : payload ? (
        <UserDetailsContent
          payload={payload}
          transactions={transactions}
          redemptions={redemptions}
        />
      ) : (
        <p className="text-sm text-[#647A9B]">No details available.</p>
      )}
    </Modal>
  );
}

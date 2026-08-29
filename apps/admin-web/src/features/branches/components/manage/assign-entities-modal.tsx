"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { cn } from "@/src/shared/lib/cn";

export interface AssignableItem {
  id: string;
  label: string;
  meta?: string;
  imageUrl?: string | null;
  /** When true, item is visible but cannot be selected/assigned. */
  disabled?: boolean;
  statusLabel?: string;
}

interface Props {
  open: boolean;
  title: string;
  items: AssignableItem[];
  isLoading?: boolean;
  isSubmitting?: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onClose: () => void;
  onAssign: (ids: string[]) => Promise<void>;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function AssignEntitiesModal({
  open,
  title,
  items,
  isLoading = false,
  isSubmitting = false,
  search,
  onSearchChange,
  onClose,
  onAssign,
  searchPlaceholder = "Search...",
  emptyMessage = "No matching records",
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      setSelected([]);
    }
  }, [open]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.meta ?? "").toLowerCase().includes(q) ||
        (item.statusLabel ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const selectableIds = useMemo(
    () => new Set(items.filter((item) => !item.disabled).map((item) => item.id)),
    [items],
  );

  const toggle = (id: string) => {
    if (!selectableIds.has(id)) {
      return;
    }

    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev, id],
    );
  };

  const assignableSelected = selected.filter((id) => selectableIds.has(id));

  return (
    <Modal
      open={open}
      title={title}
      onClose={() => {
        if (isSubmitting) {
          return;
        }
        setSelected([]);
        onClose();
      }}
      contentClassName="flex max-h-[min(90vh,720px)] w-[calc(100vw-2rem)] max-w-lg flex-col overflow-hidden"
    >
      <div className="flex min-h-0 flex-1 flex-col gap-4">
        <SearchInput
          value={search}
          placeholder={searchPlaceholder}
          onChange={onSearchChange}
        />

        <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
              Loading...
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-[#647A9B]">
              {emptyMessage}
            </p>
          ) : (
            <div className="space-y-1">
              {filtered.map((item) => {
                const checked = assignableSelected.includes(item.id);
                const isDisabled = Boolean(item.disabled);

                return (
                  <label
                    key={item.id}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-2 py-2",
                      isDisabled
                        ? "cursor-not-allowed bg-slate-100 text-slate-400"
                        : "cursor-pointer hover:bg-slate-50",
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      disabled={isDisabled || isSubmitting}
                      onCheckedChange={() => toggle(item.id)}
                    />
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-slate-50",
                        isDisabled ? "border-slate-200 opacity-60" : "border-slate-200",
                      )}
                    >
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.imageUrl}
                          alt={item.label}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] text-slate-400">IMG</span>
                      )}
                    </div>
                    <span className="min-w-0">
                      <span
                        className={cn(
                          "block text-sm font-medium",
                          isDisabled ? "text-slate-500" : "text-[#102A56]",
                        )}
                      >
                        {item.label}
                      </span>
                      {item.meta ? (
                        <span className="block text-xs text-slate-500">
                          {item.meta}
                        </span>
                      ) : null}
                      {item.statusLabel ? (
                        <span
                          className={cn(
                            "mt-0.5 block text-xs font-medium",
                            isDisabled ? "text-slate-400" : "text-slate-500",
                          )}
                        >
                          {item.statusLabel}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-[#647A9B]">
            {assignableSelected.length} selected
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => {
                setSelected([]);
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              loading={isSubmitting}
              disabled={isSubmitting || assignableSelected.length === 0}
              onClick={async () => {
                await onAssign(assignableSelected);
                setSelected([]);
              }}
            >
              Assign Selected
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

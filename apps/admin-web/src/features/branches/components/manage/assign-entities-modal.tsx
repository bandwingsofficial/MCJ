"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { Modal } from "@/src/shared/components/ui/model";
import { SearchInput } from "@/src/shared/components/ui/search-input";

export interface AssignableItem {
  id: string;
  label: string;
  meta?: string;
  imageUrl?: string | null;
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
        (item.meta ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev, id],
    );
  };

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
                const checked = selected.includes(item.id);
                return (
                  <label
                    key={item.id}
                    className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 hover:bg-slate-50"
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(item.id)}
                    />
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-slate-50">
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
                      <span className="block text-sm font-medium text-[#102A56]">
                        {item.label}
                      </span>
                      {item.meta ? (
                        <span className="block text-xs text-slate-500">
                          {item.meta}
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
          <p className="text-sm text-[#647A9B]">{selected.length} selected</p>
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
              disabled={isSubmitting || selected.length === 0}
              onClick={async () => {
                await onAssign(selected);
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

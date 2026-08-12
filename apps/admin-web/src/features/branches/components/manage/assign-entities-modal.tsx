"use client";

import { useMemo, useState } from "react";

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
}: Props) {
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.meta ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((value) => value !== id)
        : [...prev, id]
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
    >
      <div className="space-y-4">
        <SearchInput
          value={search}
          placeholder="Search..."
          onChange={onSearchChange}
        />

        <div className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-slate-200 p-2">
          {isLoading ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              Loading...
            </p>
          ) : filtered.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-slate-500">
              No matching records
            </p>
          ) : (
            filtered.map((item) => {
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
                      <span className="text-[10px] text-slate-400">
                        IMG
                      </span>
                    )}
                  </div>
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-slate-900">
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
            })
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">
            {selected.length} selected
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
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
              loading={isSubmitting}
              disabled={
                isSubmitting || selected.length === 0
              }
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

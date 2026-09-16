"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SiteSearchDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    onClose();
    setQuery("");
    router.push(
      trimmed ? `/courses?search=${encodeURIComponent(trimmed)}` : "/courses",
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[#0B1F3A]/40 px-4 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0B1F3A]">Search courses</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by course name..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none ring-[#2563EB] focus:ring-2"
            />
          </div>
          <Button type="submit">Search</Button>
        </form>
      </div>
    </div>
  );
}

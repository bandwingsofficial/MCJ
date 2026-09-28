"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { GLOBAL_SEARCH_DEBOUNCE_MS } from "@/src/shared/search/global-search.constants";
import { GlobalSearchResultsPanel } from "@/src/shared/search/global-search-results-panel";
import type { GlobalSearchItem } from "@/src/shared/search/global-search.types";
import { useGlobalSearch } from "@/src/shared/search/use-global-search";
import { useDebounce } from "@/src/shared/hooks/use-debounce";

interface Props {
  open: boolean;
  onClose: () => void;
}

export function SiteSearchDialog({ open, onClose }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(query, GLOBAL_SEARCH_DEBOUNCE_MS);

  useEffect(() => {
    setSearchQuery(debouncedQuery.trim());
  }, [debouncedQuery]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSearchQuery("");
    }
  }, [open]);

  const { data, isFetching, isFetched } = useGlobalSearch(searchQuery);
  const groups = data?.groups ?? [];
  const hasQuery = searchQuery.length >= 2;
  const showPanel = hasQuery && (isFetching || isFetched);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    setSearchQuery(trimmed);
  };

  const handleSelect = (item: GlobalSearchItem) => {
    onClose();
    setQuery("");
    setSearchQuery("");
    router.push(item.href);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-[#0B1F3A]/40 px-4 pt-16 sm:pt-24 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-[#0B1F3A]">Search MCJ</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close search"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search courses, branches, trainers, batches…"
                className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none ring-[#2563EB] focus:ring-2"
                aria-autocomplete="list"
                aria-controls="global-search-results"
              />
            </div>
            <Button type="submit">Search</Button>
          </div>

          {showPanel ? (
            <div
              id="global-search-results"
              className="border-t border-slate-100 pt-2"
              role="listbox"
            >
              <GlobalSearchResultsPanel
                groups={groups}
                isFetching={isFetching}
                hasQuery={hasQuery}
                onSelect={handleSelect}
              />
            </div>
          ) : null}
        </form>
      </div>
    </div>
  );
}

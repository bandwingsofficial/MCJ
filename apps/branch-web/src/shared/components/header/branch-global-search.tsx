"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Loader2, Search } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { cn } from "@/src/shared/lib/cn";
import {
  fetchBranchGlobalSearchResults,
  type BranchGlobalSearchGroup,
} from "@/src/shared/services/branch-global-search.service";

const DEBOUNCE_MS = 300;

type BranchGlobalSearchProps = {
  className?: string;
};

export function BranchGlobalSearch({ className }: BranchGlobalSearchProps) {
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [groups, setGroups] = useState<BranchGlobalSearchGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery) {
      setGroups([]);
      setIsLoading(false);
      return;
    }

    const requestId = ++requestIdRef.current;
    setIsLoading(true);

    void fetchBranchGlobalSearchResults(debouncedQuery)
      .then((nextGroups) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setGroups(nextGroups);
      })
      .finally(() => {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
        }
      });
  }, [debouncedQuery]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const hasQuery = debouncedQuery.length > 0;
  const hasResults = groups.some((group) => group.items.length > 0);
  const showPanel = isOpen && hasQuery;

  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
    }
  }, []);

  const closePanel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 z-[1] h-4 w-4 -translate-y-1/2 text-[#8AA0BB]"
        strokeWidth={2}
        aria-hidden
      />
      <Input
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listboxId : undefined}
        aria-autocomplete="list"
        placeholder="Search students, trainers, batches, applications..."
        value={query}
        onChange={(event) => handleQueryChange(event.target.value)}
        onFocus={() => {
          if (query.trim()) {
            setIsOpen(true);
          }
        }}
        className={cn(
          "h-11 w-full rounded-xl border-[#DCE8F5] bg-white/90 pl-10 pr-10",
          "text-sm text-[#102A56] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_2px_8px_rgba(16,42,86,0.04)]",
          "placeholder:text-[#8AA0BB]",
          "focus-visible:border-[#2563EB]/40 focus-visible:ring-2 focus-visible:ring-[#2563EB]/15",
        )}
      />
      {isLoading && hasQuery ? (
        <Loader2
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#8AA0BB]"
          aria-hidden
        />
      ) : null}

      {showPanel ? (
        <div
          id={listboxId}
          role="listbox"
          className={cn(
            "absolute left-0 right-0 top-[calc(100%+6px)] z-50 max-h-[min(420px,70vh)] overflow-y-auto",
            "rounded-2xl border border-[#DCE8F5] bg-white",
            "shadow-[0_12px_40px_rgba(16,42,86,0.12)]",
          )}
        >
          {isLoading && !hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-[#647A9B]">
              Searching…
            </p>
          ) : null}

          {!isLoading && !hasResults ? (
            <p className="px-4 py-6 text-center text-sm text-[#647A9B]">
              No results found
            </p>
          ) : null}

          {hasResults
            ? groups.map((group) =>
                group.items.length === 0 ? null : (
                  <div
                    key={group.type}
                    className="border-b border-[#E8F1FF] last:border-b-0"
                  >
                    <p className="sticky top-0 bg-[#F8FBFF]/95 px-4 py-2 text-[10px] font-semibold uppercase tracking-wide text-[#647A9B] backdrop-blur-sm">
                      {group.typeLabel}
                    </p>
                    <ul className="px-1.5 pb-2">
                      {group.items.map((item) => (
                        <li key={`${item.type}-${item.id}`}>
                          <div className="flex items-start gap-2 rounded-xl px-2.5 py-2 transition-colors hover:bg-[#F4F9FF]">
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
                                {item.typeLabel}
                              </p>
                              <p className="truncate text-sm font-medium text-[#102A56]">
                                {item.title}
                              </p>
                              <p className="truncate text-xs text-[#647A9B]">
                                {item.subtitle}
                              </p>
                            </div>
                            <Link
                              href={item.href}
                              onClick={closePanel}
                              className={cn(
                                "shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#2563EB]",
                                "transition-colors hover:bg-[#E8F1FF]",
                              )}
                            >
                              View
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )
            : null}
        </div>
      ) : null}
    </div>
  );
}

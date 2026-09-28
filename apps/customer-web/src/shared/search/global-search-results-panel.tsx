"use client";

import Image from "next/image";
import {
  BookOpen,
  Building2,
  FolderOpen,
  Layers,
  Loader2,
  Newspaper,
  User,
} from "lucide-react";

import type {
  GlobalSearchEntityType,
  GlobalSearchGroup,
  GlobalSearchItem,
} from "@/src/shared/search/global-search.types";

const ENTITY_ICONS: Record<
  GlobalSearchEntityType,
  typeof BookOpen
> = {
  course: BookOpen,
  branch: Building2,
  trainer: User,
  batch: Layers,
  category: FolderOpen,
  "financial-article": Newspaper,
};

const ENTITY_SHORT_LABEL: Record<GlobalSearchEntityType, string> = {
  course: "Course",
  branch: "Branch",
  trainer: "Trainer",
  batch: "Batch",
  category: "Category",
  "financial-article": "News",
};

interface GlobalSearchResultsPanelProps {
  groups: GlobalSearchGroup[];
  isFetching: boolean;
  hasQuery: boolean;
  onSelect: (item: GlobalSearchItem) => void;
}

function ResultThumbnail({ item }: { item: GlobalSearchItem }) {
  const Icon = ENTITY_ICONS[item.type];

  if (item.imageUrl) {
    return (
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
        <Image
          src={item.imageUrl}
          alt=""
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF2FB] text-[#2563EB]">
      <Icon className="h-4 w-4" aria-hidden />
    </div>
  );
}

export function GlobalSearchResultsPanel({
  groups,
  isFetching,
  hasQuery,
  onSelect,
}: GlobalSearchResultsPanelProps) {
  if (!hasQuery) {
    return null;
  }

  if (isFetching && groups.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
        Searching…
      </div>
    );
  }

  if (!isFetching && groups.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">
        No results found. Try a different keyword.
      </p>
    );
  }

  return (
    <div className="max-h-[min(20rem,50vh)] space-y-4 overflow-y-auto overscroll-contain py-1">
      {isFetching && groups.length > 0 ? (
        <div className="flex items-center gap-2 px-1 text-xs text-slate-400">
          <Loader2 className="h-3 w-3 animate-spin" />
          Updating results…
        </div>
      ) : null}

      {groups.map((group) => (
        <div key={group.type}>
          <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {group.label}
          </p>
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => onSelect(item)}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-[#F8FBFF] focus-visible:bg-[#F8FBFF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                >
                  <ResultThumbnail item={item} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#0B1F3A]">
                      {item.title}
                    </p>
                    {item.subtitle ? (
                      <p className="truncate text-xs text-slate-500">
                        {item.subtitle}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-[10px] font-medium text-slate-400">
                    {ENTITY_SHORT_LABEL[item.type]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

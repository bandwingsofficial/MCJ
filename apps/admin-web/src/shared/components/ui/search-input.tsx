"use client";

import { Search } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";

import { cn } from "@/src/shared/lib/cn";

interface SearchInputProps {
  value: string;

  placeholder?: string;

  className?: string;

  onChange: (value: string) => void;
}

export function SearchInput({
  value,
  placeholder = "Search...",
  className,
  onChange,
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8AA0BB]"
      />

      <Input
        value={value ?? ""}
        placeholder={placeholder}
        className={cn("pl-10", className)}
        onChange={(e) =>
          onChange(e.target.value)
        }
      />
    </div>
  );
}
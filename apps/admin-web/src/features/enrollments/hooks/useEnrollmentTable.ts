"use client";

import { useState } from "react";

export const useEnrollmentTable =
  () => {
    const [
      selectedIds,
      setSelectedIds,
    ] = useState<string[]>([]);

    const toggleSelection = (
      id: string,
    ) => {
      setSelectedIds(
        (previous) =>
          previous.includes(id)
            ? previous.filter(
                (item) =>
                  item !== id,
              )
            : [
                ...previous,
                id,
              ],
      );
    };

    const clearSelection =
      () => {
        setSelectedIds([]);
      };

    return {
      selectedIds,
      toggleSelection,
      clearSelection,
    };
  };
"use client";

import { useState } from "react";

import {
  EnrollmentFilters,
} from "../types";

import {
  SortOrder,
} from "../types/enrollment.enums";

export const useEnrollmentFilters =
  () => {
    const [filters, setFilters] =
      useState<EnrollmentFilters>({
        skip: 0,
take: 10,
        search: "",
        status: undefined,
        paymentStatus:
          undefined,
        branchId: undefined,
        batchId: undefined,
        courseId: undefined,
        isActive: undefined,
        sortBy: "createdAt",
        sortOrder:
          SortOrder.DESC,
      });

    const resetFilters =
      () => {
        setFilters({
         skip: 0,
take: 10,
          search: "",
          status: undefined,
          paymentStatus:
            undefined,
          branchId: undefined,
          batchId: undefined,
          courseId: undefined,
          isActive:
            undefined,
          sortBy:
            "createdAt",
          sortOrder:
            SortOrder.DESC,
        });
      };

    return {
      filters,
      setFilters,
      resetFilters,
    };
  };
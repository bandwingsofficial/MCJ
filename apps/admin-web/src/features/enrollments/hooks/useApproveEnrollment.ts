"use client";

import { useState } from "react";

import { enrollmentService } from "../services/enrollment.service";

export function useApproveEnrollment() {
  const [isLoading, setIsLoading] = useState(false);

  const approveEnrollment = async (id: string) => {
    setIsLoading(true);

    try {
      return await enrollmentService.approveEnrollment(id);
    } finally {
      setIsLoading(false);
    }
  };

  return { approveEnrollment, isLoading };
}

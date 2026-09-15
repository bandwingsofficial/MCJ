"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";

export const useFinanceNewsActions = () => {
  const [isLoading, setIsLoading] = useState(false);

  const execute = async (
    action: () => Promise<{ message?: string }>,
    successMessage: string,
  ) => {
    try {
      setIsLoading(true);
      const response = await action();
      appToast.success(response.message ?? successMessage);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,

    activateFinanceNews: (id: string) =>
      execute(
        () => financeNewsService.activateFinanceNews(id),
        "Financial news activated",
      ),

    deactivateFinanceNews: (id: string) =>
      execute(
        () => financeNewsService.deactivateFinanceNews(id),
        "Financial news deactivated",
      ),

    deleteFinanceNews: (id: string) =>
      execute(
        () => financeNewsService.deleteFinanceNews(id),
        "Financial news archived",
      ),

    restoreFinanceNews: (id: string) =>
      execute(
        () => financeNewsService.restoreFinanceNews(id),
        "Financial news restored",
      ),

    permanentDeleteFinanceNews: (id: string) =>
      execute(
        () => financeNewsService.permanentDeleteFinanceNews(id),
        "Financial news permanently deleted",
      ),
  };
};

export const useActivateFinanceNews = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const activateFinanceNews = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await financeNewsService.activateFinanceNews(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, activateFinanceNews };
};

export const useDeactivateFinanceNews = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const deactivateFinanceNews = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await financeNewsService.deactivateFinanceNews(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, deactivateFinanceNews };
};

export const useDeleteFinanceNews = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteFinanceNews = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await financeNewsService.deleteFinanceNews(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, deleteFinanceNews };
};

export const useRestoreFinanceNews = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const restoreFinanceNews = async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await financeNewsService.restoreFinanceNews(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, restoreFinanceNews };
};

export const usePermanentDeleteFinanceNews = (onSuccess?: () => void) => {
  const [isLoading, setIsLoading] = useState(false);

  const permanentDeleteFinanceNews = async (
    id: string,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response =
        await financeNewsService.permanentDeleteFinanceNews(id);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      appToast.error(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, permanentDeleteFinanceNews };
};

// src/shared/lib/react-query.ts

import { QueryClient } from "@tanstack/react-query";

export const queryClient =
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: (
          failureCount,
          error
        ) => {
          if (
            failureCount >= 2
          ) {
            return false;
          }

          return true;
        },

        staleTime:
          1000 * 60 * 5,

        refetchOnWindowFocus:
          false,

        refetchOnReconnect:
          true,
      },

      mutations: {
        retry: false,
      },
    },
  });
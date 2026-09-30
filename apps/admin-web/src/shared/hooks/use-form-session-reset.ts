import { useEffect, useRef } from "react";

import type { FieldValues, UseFormReset } from "react-hook-form";

type Options = {
  enabled?: boolean;
  onReset?: () => void;
};

/**
 * Resets react-hook-form only when `sessionKey` changes (new create/edit session),
 * not when parent recreates default value objects on refetch/rerender.
 */
export function useFormSessionReset<T extends FieldValues>(
  reset: UseFormReset<T>,
  sessionKey: string | null | undefined,
  values: T,
  options?: Options,
): void {
  const lastSessionKeyRef = useRef<string | null>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    const enabled = options?.enabled ?? true;

    if (!enabled || !sessionKey) {
      if (!sessionKey) {
        lastSessionKeyRef.current = null;
      }
      return;
    }

    if (lastSessionKeyRef.current === sessionKey) {
      return;
    }

    lastSessionKeyRef.current = sessionKey;
    options?.onReset?.();
    reset(valuesRef.current);
  }, [sessionKey, options?.enabled, reset, options?.onReset]);
}

export function buildEntityFormSessionKey(
  entity: { id: string; updatedAt?: string | Date | null } | null | undefined,
  createKey = "create",
): string | undefined {
  if (!entity?.id) {
    return createKey;
  }

  const updatedAt =
    entity.updatedAt instanceof Date
      ? entity.updatedAt.toISOString()
      : (entity.updatedAt ?? "static");

  return `${entity.id}:${updatedAt}`;
}

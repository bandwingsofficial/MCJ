import { useCallback, useMemo, useState } from "react";

import { buildEntityFormSessionKey } from "@/src/shared/hooks/use-form-session-reset";

type EntityLike = {
  id: string;
  updatedAt?: string | Date | null;
};

/**
 * Stable react-hook-form session keys for create/edit modals.
 * Call `discardCreateSession` on Cancel / successful Save for create flows.
 */
export function useModalFormSessionKey(
  open: boolean,
  entity: EntityLike | null | undefined,
  createScope: string,
) {
  const [createSession, setCreateSession] = useState(0);

  const sessionKey = useMemo(() => {
    if (!open) {
      return undefined;
    }

    if (entity?.id) {
      return buildEntityFormSessionKey(entity);
    }

    return `create-${createScope}-${createSession}`;
  }, [open, entity, createScope, createSession]);

  const discardCreateSession = useCallback(() => {
    setCreateSession((value) => value + 1);
  }, []);

  return { sessionKey, discardCreateSession };
}

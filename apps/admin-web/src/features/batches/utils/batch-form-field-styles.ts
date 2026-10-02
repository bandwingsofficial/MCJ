import { cn } from "@/src/shared/lib/cn";
import {
  iconDecorInputClass,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";

export function batchIconInputClass(state: FieldVisualState, extra = "") {
  return iconDecorInputClass(state, cn("w-full min-w-0 max-w-full", extra));
}

export function batchPlainInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    extra,
  );
}

/** Select triggers with a left field icon (chevron stays on the right). */
export function batchSelectTriggerClass(state: FieldVisualState, extra = "") {
  return validatedFieldInputClass(state, cn("w-full min-w-0 max-w-full", extra), {
    select: true,
    leftIcon: true,
  });
}

export function batchFieldVisualState(
  error: string | null,
  touched: boolean,
): FieldVisualState {
  if (!touched) {
    return "neutral";
  }

  if (error) {
    return "invalid";
  }

  return "valid";
}

"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";
import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

import {
  createBranchSchema,
  CreateBranchFormValues,
} from "@/src/features/branches/schemas/branch.schema";

import { branchService } from "@/src/features/branches/services/branch.service";

const AVAILABILITY_DEBOUNCE_MS = 400;
const SUGGEST_DEBOUNCE_MS = 450;

type SyncFieldName = Exclude<
  keyof CreateBranchFormValues,
  "branchName" | "branchCode" | "addressLine2" | "description"
>;

interface BranchFormProps {
  defaultValues?: Partial<CreateBranchFormValues>;

  /** When set, form is edit mode — do not auto-regenerate code from name. */
  excludeId?: string;

  isSubmitting: boolean;

  submitLabel: string;

  onSubmit: (
    values: CreateBranchFormValues
  ) => Promise<void>;
}

export function BranchForm({
  defaultValues,
  excludeId,
  isSubmitting,
  submitLabel,
  onSubmit,
}: BranchFormProps) {
  const isEdit = Boolean(excludeId);

  const codeManuallyEditedRef = useRef(isEdit);
  const lastSuggestedCodeRef = useRef(
    defaultValues?.branchCode?.toUpperCase() ?? ""
  );
  const suggestRequestIdRef = useRef(0);
  const nameCheckIdRef = useRef(0);
  const codeCheckIdRef = useRef(0);

  const [nameTouched, setNameTouched] = useState(false);
  const [codeTouched, setCodeTouched] = useState(false);

  const [nameChecking, setNameChecking] = useState(false);
  const [codeChecking, setCodeChecking] = useState(false);

  const [nameAvailable, setNameAvailable] = useState<
    boolean | null
  >(null);
  const [codeAvailable, setCodeAvailable] = useState<
    boolean | null
  >(null);

  const [nameAsyncError, setNameAsyncError] = useState<
    string | null
  >(null);
  const [codeAsyncError, setCodeAsyncError] = useState<
    string | null
  >(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<CreateBranchFormValues>({
    resolver: zodResolver(createBranchSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      branchName: "",
      branchCode: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      latitude: 0,
      longitude: 0,
      description: "",
      ...defaultValues,
    },
  });

  const branchName = watch("branchName");
  const branchCode = watch("branchCode");
  const values = watch();

  // Seed form when the loaded branch identity/version changes (edit reopen).
  useEffect(() => {
    if (!defaultValues || !excludeId) {
      return;
    }

    reset({
      branchName: "",
      branchCode: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      latitude: 0,
      longitude: 0,
      description: "",
      ...defaultValues,
    });
    codeManuallyEditedRef.current = isEdit;
    lastSuggestedCodeRef.current =
      defaultValues.branchCode?.toUpperCase() ?? "";
    // Run availability with excludeId so the current branch name/code
    // show as available rather than a false duplicate.
    setNameTouched(true);
    setCodeTouched(true);
    setNameAvailable(null);
    setNameAsyncError(null);
    setCodeAvailable(null);
    setCodeAsyncError(null);
  }, [
    excludeId,
    defaultValues?.branchName,
    defaultValues?.branchCode,
    defaultValues?.email,
    defaultValues?.phone,
    defaultValues?.addressLine1,
    defaultValues?.addressLine2,
    defaultValues?.city,
    defaultValues?.state,
    defaultValues?.country,
    defaultValues?.postalCode,
    defaultValues?.latitude,
    defaultValues?.longitude,
    defaultValues?.description,
    isEdit,
    reset,
  ]);

  // Auto-suggest branch code on create only.
  useEffect(() => {
    if (isEdit) {
      return;
    }

    const trimmed = (branchName ?? "").trim();

    if (trimmed.length < 3) {
      return;
    }

    if (codeManuallyEditedRef.current) {
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++suggestRequestIdRef.current;

      try {
        const response =
          await branchService.suggestBranchCode(trimmed);

        if (requestId !== suggestRequestIdRef.current) {
          return;
        }

        if (codeManuallyEditedRef.current) {
          return;
        }

        const suggested = response.data.branchCode;
        lastSuggestedCodeRef.current = suggested;
        setValue("branchCode", suggested, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setCodeTouched(true);
      } catch {
        // Suggestion is UX-only; keep typing uninterrupted.
      }
    }, SUGGEST_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [branchName, isEdit, setValue]);

  // Live name uniqueness (case-insensitive via backend; exclude current id in edit)
  useEffect(() => {
    const trimmed = (branchName ?? "").trim();

    if (!nameTouched || trimmed.length < 3) {
      setNameChecking(false);
      setNameAvailable(null);
      setNameAsyncError(null);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++nameCheckIdRef.current;
      setNameChecking(true);

      try {
        const response =
          await branchService.checkAvailability({
            branchName: trimmed,
            excludeId,
          });

        if (requestId !== nameCheckIdRef.current) {
          return;
        }

        const available = response.data.branchNameAvailable;
        setNameAvailable(available);
        setNameAsyncError(
          available === false
            ? response.data.branchNameMessage ??
                "Branch name already exists."
            : null
        );
      } catch {
        if (requestId !== nameCheckIdRef.current) {
          return;
        }
        setNameAvailable(null);
        setNameAsyncError(null);
      } finally {
        if (requestId === nameCheckIdRef.current) {
          setNameChecking(false);
        }
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [branchName, excludeId, nameTouched]);

  // Live code uniqueness
  useEffect(() => {
    const trimmed = (branchCode ?? "").trim();

    if (!codeTouched || trimmed.length < 2) {
      setCodeChecking(false);
      setCodeAvailable(null);
      setCodeAsyncError(null);
      return;
    }

    const timer = setTimeout(async () => {
      const requestId = ++codeCheckIdRef.current;
      setCodeChecking(true);

      try {
        const response =
          await branchService.checkAvailability({
            branchCode: trimmed,
            excludeId,
          });

        if (requestId !== codeCheckIdRef.current) {
          return;
        }

        const available = response.data.branchCodeAvailable;
        setCodeAvailable(available);
        setCodeAsyncError(
          available === false
            ? response.data.branchCodeMessage ??
                "Branch code already exists."
            : null
        );
      } catch {
        if (requestId !== codeCheckIdRef.current) {
          return;
        }
        setCodeAvailable(null);
        setCodeAsyncError(null);
      } finally {
        if (requestId === codeCheckIdRef.current) {
          setCodeChecking(false);
        }
      }
    }, AVAILABILITY_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [branchCode, excludeId, codeTouched]);

  const applyConflictFromError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : "";
    const lower = message.toLowerCase();

    if (
      lower.includes("branch name") ||
      (lower.includes("name") && lower.includes("already exists"))
    ) {
      setNameTouched(true);
      setNameAvailable(false);
      setNameAsyncError(
        "Branch name already exists."
      );
      return;
    }

    if (
      lower.includes("branch code") ||
      (lower.includes("code") && lower.includes("already exists"))
    ) {
      setCodeTouched(true);
      setCodeAvailable(false);
      setCodeAsyncError(
        "Branch code already exists."
      );
      return;
    }

    if (lower.includes("already exists")) {
      setNameTouched(true);
      setNameAvailable(false);
      setNameAsyncError(
        message.trim() || "Branch name already exists."
      );
    }
  };

  const nameRegister = register("branchName");
  const codeRegister = register("branchCode");

  const nameState: FieldVisualState = nameChecking
    ? "checking"
    : nameAvailable === false || errors.branchName
      ? "invalid"
      : !nameTouched
        ? "neutral"
        : nameAvailable === true
          ? "valid"
          : errors.branchName
            ? "invalid"
            : "neutral";

  const codeState: FieldVisualState = codeChecking
    ? "checking"
    : codeAvailable === false || errors.branchCode
      ? "invalid"
      : !codeTouched
        ? "neutral"
        : codeAvailable === true
          ? "valid"
          : errors.branchCode
            ? "invalid"
            : "neutral";

  const getSyncFieldState = (
    name: SyncFieldName
  ): FieldVisualState => {
    const interacted =
      Boolean(touchedFields[name]) ||
      Boolean(dirtyFields[name]) ||
      isSubmitted;

    if (!interacted) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    const raw = values[name];
    if (raw === undefined || raw === null) {
      return "neutral";
    }

    if (typeof raw === "string" && raw.trim() === "") {
      return "invalid";
    }

    return "valid";
  };

  const syncField = (
    name: SyncFieldName,
    registerName: SyncFieldName = name
  ) => {
    const registration = register(registerName);
    const state = getSyncFieldState(name);

    return {
      state,
      errorMessage: errors[name]?.message,
      inputProps: {
        ...registration,
        className: validatedFieldInputClass(state),
        onBlur: (
          event: FocusEvent<HTMLInputElement>
        ) => {
          registration.onBlur(event);
          void trigger(registerName);
        },
        onChange: (
          event: ChangeEvent<HTMLInputElement>
        ) => {
          registration.onChange(event);
          void trigger(registerName);
        },
      },
    };
  };

  const emailField = syncField("email");
  const phoneField = syncField("phone");
  const address1Field = syncField("addressLine1");
  const cityField = syncField("city");
  const stateField = syncField("state");
  const countryField = syncField("country");
  const postalField = syncField("postalCode");
  const latField = syncField("latitude");
  const lngField = syncField("longitude");

  return (
    <form
      onSubmit={handleSubmit(async (formValues) => {
        if (
          nameChecking ||
          codeChecking ||
          nameAvailable === false ||
          codeAvailable === false
        ) {
          return;
        }

        const trimmedName = formValues.branchName.trim();
        const trimmedCode = formValues.branchCode.trim();

        // Final authoritative availability check before submit (race-safe).
        try {
          setNameChecking(true);
          setCodeChecking(true);

          const response =
            await branchService.checkAvailability({
              branchName: trimmedName,
              branchCode: trimmedCode,
              excludeId,
            });

          if (response.data.branchNameAvailable === false) {
            setNameTouched(true);
            setNameAvailable(false);
            setNameAsyncError(
              response.data.branchNameMessage ??
                "Branch name already exists."
            );
            return;
          }

          if (response.data.branchCodeAvailable === false) {
            setCodeTouched(true);
            setCodeAvailable(false);
            setCodeAsyncError(
              response.data.branchCodeMessage ??
                "Branch code already exists."
            );
            return;
          }

          setNameAvailable(true);
          setNameAsyncError(null);
          setCodeAvailable(true);
          setCodeAsyncError(null);
        } catch {
          // If the pre-check fails, still attempt submit and rely on backend.
        } finally {
          setNameChecking(false);
          setCodeChecking(false);
        }

        try {
          await onSubmit({
            ...formValues,
            branchName: trimmedName,
            branchCode: trimmedCode,
          });
        } catch (error) {
          applyConflictFromError(error);
        }
      })}
      className="space-y-5"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ValidatedField
          label="Branch Name"
          required
          state={nameState}
          errorMessage={
            nameAsyncError ?? errors.branchName?.message
          }
          successMessage="Available"
        >
          <Input
            {...nameRegister}
            placeholder="Enter branch name"
            className={validatedFieldInputClass(nameState)}
            onBlur={(event) => {
              nameRegister.onBlur(event);
              setNameTouched(true);
              void trigger("branchName");
            }}
            onChange={(event) => {
              nameRegister.onChange(event);
              setNameTouched(true);
              void trigger("branchName");
            }}
          />
        </ValidatedField>

        <ValidatedField
          label="Branch Code"
          required
          state={codeState}
          errorMessage={
            codeAsyncError ?? errors.branchCode?.message
          }
          successMessage="Available"
        >
          <Input
            {...codeRegister}
            placeholder="Auto-generated branch code"
            className={validatedFieldInputClass(codeState)}
            onBlur={(event) => {
              codeRegister.onBlur(event);
              setCodeTouched(true);
              void trigger("branchCode");
            }}
            onChange={(event) => {
              const value = event.target.value;
              const normalized = value.trim().toUpperCase();

              if (
                normalized &&
                normalized !== lastSuggestedCodeRef.current
              ) {
                codeManuallyEditedRef.current = true;
              }

              codeRegister.onChange(event);
              setCodeTouched(true);
              void trigger("branchCode");
            }}
          />
        </ValidatedField>

        <ValidatedField
          label="Email"
          required
          state={emailField.state}
          errorMessage={emailField.errorMessage}
        >
          <Input
            {...emailField.inputProps}
            placeholder="Enter branch email"
          />
        </ValidatedField>

        <ValidatedField
          label="Phone"
          required
          state={phoneField.state}
          errorMessage={phoneField.errorMessage}
        >
          <Input
            {...phoneField.inputProps}
            placeholder="Enter branch phone number"
          />
        </ValidatedField>

        <ValidatedField
          label="Address Line 1"
          required
          state={address1Field.state}
          errorMessage={address1Field.errorMessage}
        >
          <Input
            {...address1Field.inputProps}
            placeholder="Enter address line 1"
          />
        </ValidatedField>

        <div className="min-w-0">
          <Label>Address Line 2</Label>
          <Input
            {...register("addressLine2")}
            placeholder="Enter address line 2 (optional)"
          />
          <div className="mt-1 min-h-[1.25rem]" />
        </div>

        <ValidatedField
          label="City"
          required
          state={cityField.state}
          errorMessage={cityField.errorMessage}
        >
          <Input
            {...cityField.inputProps}
            placeholder="Enter city"
          />
        </ValidatedField>

        <ValidatedField
          label="State"
          required
          state={stateField.state}
          errorMessage={stateField.errorMessage}
        >
          <Input
            {...stateField.inputProps}
            placeholder="Enter state"
          />
        </ValidatedField>

        <ValidatedField
          label="Country"
          required
          state={countryField.state}
          errorMessage={countryField.errorMessage}
        >
          <Input
            {...countryField.inputProps}
            placeholder="Enter country"
          />
        </ValidatedField>

        <ValidatedField
          label="Postal Code"
          required
          state={postalField.state}
          errorMessage={postalField.errorMessage}
        >
          <Input
            {...postalField.inputProps}
            placeholder="Enter postal code"
          />
        </ValidatedField>

        <ValidatedField
          label="Latitude"
          required
          state={latField.state}
          errorMessage={latField.errorMessage}
        >
          <Input
            type="number"
            step="any"
            {...latField.inputProps}
            placeholder="Enter latitude"
          />
        </ValidatedField>

        <ValidatedField
          label="Longitude"
          required
          state={lngField.state}
          errorMessage={lngField.errorMessage}
        >
          <Input
            type="number"
            step="any"
            {...lngField.inputProps}
            placeholder="Enter longitude"
          />
        </ValidatedField>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea
          {...register("description")}
          placeholder="Enter branch description (optional)"
        />
        <FormError
          message={errors.description?.message}
        />
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          nameChecking ||
          codeChecking ||
          nameAvailable === false ||
          codeAvailable === false
        }
      >
        {submitLabel}
      </Button>
    </form>
  );
}

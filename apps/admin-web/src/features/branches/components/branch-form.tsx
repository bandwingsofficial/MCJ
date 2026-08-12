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
    setNameTouched(false);
    setCodeTouched(false);
    setNameAvailable(null);
    setCodeAvailable(null);
    setNameAsyncError(null);
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

  // Live name uniqueness
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

        setNameAvailable(
          response.data.branchNameAvailable
        );
        setNameAsyncError(
          response.data.branchNameMessage
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

        setCodeAvailable(
          response.data.branchCodeAvailable
        );
        setCodeAsyncError(
          response.data.branchCodeMessage
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

  const nameRegister = register("branchName");
  const codeRegister = register("branchCode");

  const nameState: FieldVisualState = nameChecking
    ? "checking"
    : !nameTouched
      ? "neutral"
      : nameAvailable === false || errors.branchName
        ? "invalid"
        : nameAvailable === true
          ? "valid"
          : errors.branchName
            ? "invalid"
            : "neutral";

  const codeState: FieldVisualState = codeChecking
    ? "checking"
    : !codeTouched
      ? "neutral"
      : codeAvailable === false || errors.branchCode
        ? "invalid"
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
          nameAvailable === false ||
          codeAvailable === false
        ) {
          return;
        }
        await onSubmit(formValues);
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
            placeholder="Branch Name"
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
            placeholder="Branch Code"
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
            placeholder="Email"
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
            placeholder="Phone"
          />
        </ValidatedField>

        <ValidatedField
          label="Address Line 1"
          required
          state={address1Field.state}
          errorMessage={address1Field.errorMessage}
        >
          <Input {...address1Field.inputProps} />
        </ValidatedField>

        <div className="min-w-0">
          <Label>Address Line 2</Label>
          <Input {...register("addressLine2")} />
          <div className="mt-1 min-h-[1.25rem]" />
        </div>

        <ValidatedField
          label="City"
          required
          state={cityField.state}
          errorMessage={cityField.errorMessage}
        >
          <Input {...cityField.inputProps} />
        </ValidatedField>

        <ValidatedField
          label="State"
          required
          state={stateField.state}
          errorMessage={stateField.errorMessage}
        >
          <Input {...stateField.inputProps} />
        </ValidatedField>

        <ValidatedField
          label="Country"
          required
          state={countryField.state}
          errorMessage={countryField.errorMessage}
        >
          <Input {...countryField.inputProps} />
        </ValidatedField>

        <ValidatedField
          label="Postal Code"
          required
          state={postalField.state}
          errorMessage={postalField.errorMessage}
        >
          <Input {...postalField.inputProps} />
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
          />
        </ValidatedField>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} />
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

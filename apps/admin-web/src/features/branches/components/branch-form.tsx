"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";

import Image from "next/image";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import {
  Building2,
  Compass,
  FileText,
  Globe,
  Hash,
  ImageIcon,
  Mail,
  Map,
  MapPin,
  MapPinned,
  Phone,
  Tag,
  Upload,
  X,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";
import {
  FieldVisualState,
  IconValidatedField,
  iconDecorInputClass,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import {
  createBranchSchema,
  CreateBranchFormValues,
} from "@/src/features/branches/schemas/branch.schema";

import { branchService } from "@/src/features/branches/services/branch.service";
import { mapBranchApiError } from "@/src/features/branches/utils/branch-form-errors";

const AVAILABILITY_DEBOUNCE_MS = 400;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

function iconInputClass(state: FieldVisualState, extra = "") {
  return iconDecorInputClass(state, cn("w-full min-w-0 max-w-full", extra));
}

function IconField({
  label,
  required,
  state,
  errorMessage,
  checkingMessage,
  successMessage,
  icon,
  select,
  children,
}: {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string;
  checkingMessage?: string;
  successMessage?: string;
  icon: LucideIcon;
  select?: boolean;
  children: ReactNode;
}) {
  return (
    <IconValidatedField
      label={label}
      required={required}
      state={state}
      errorMessage={errorMessage}
      checkingMessage={checkingMessage}
      successMessage={successMessage}
      icon={icon}
      select={select}
    >
      {children}
    </IconValidatedField>
  );
}

type SyncFieldName = Exclude<
  keyof CreateBranchFormValues,
  "branchName" | "branchCode" | "addressLine2" | "description"
>;

interface BranchFormProps {
  defaultValues?: Partial<CreateBranchFormValues> & {
    thumbnailUrl?: string | null;
  };

  /** When set, form is edit mode — do not auto-regenerate code from name. */
  excludeId?: string;

  isSubmitting: boolean;

  submitLabel: string;

  onSubmit: (
    values: CreateBranchFormValues,
    image: File | null,
    removeImage: boolean,
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const suggestRequestIdRef = useRef(0);
  const nameCheckIdRef = useRef(0);
  const codeCheckIdRef = useRef(0);
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);

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

  const [imageTouched, setImageTouched] = useState(isEdit);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    defaultValues?.thumbnailUrl ?? null,
  );
  const [removeImage, setRemoveImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageBroken, setImageBroken] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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
    setNameTouched(true);
    setCodeTouched(true);
    setNameAvailable(null);
    setNameAsyncError(null);
    setCodeAvailable(null);
    setCodeAsyncError(null);
    setPreviewUrl(defaultValues?.thumbnailUrl ?? null);
    setSelectedImage(null);
    setRemoveImage(false);
    setImageBroken(false);
    setImageError(null);
    setImageTouched(true);
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
    defaultValues?.thumbnailUrl,
    isEdit,
    reset,
  ]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);
    setImageBroken(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedImage]);

  // Auto-generate branch code on create (MCJB001, MCJB002, …).
  useEffect(() => {
    if (isEdit) {
      return;
    }

    const requestId = ++suggestRequestIdRef.current;
    setIsSuggestingCode(true);

    void branchService
      .suggestBranchCode()
      .then((response) => {
        if (requestId !== suggestRequestIdRef.current) {
          return;
        }

        const suggested = response.data.branchCode;
        setValue("branchCode", suggested, {
          shouldDirty: true,
          shouldValidate: true,
        });
        setCodeTouched(true);
      })
      .catch(() => {
        // Suggestion is UX-only; keep form usable.
      })
      .finally(() => {
        if (requestId === suggestRequestIdRef.current) {
          setIsSuggestingCode(false);
        }
      });
  }, [isEdit, setValue]);

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
    const mapped = mapBranchApiError(error);

    if (mapped.image) {
      setImageTouched(true);
      setImageError(mapped.image);
      return;
    }

    const message = mapped.root ?? (error instanceof Error ? error.message : "");
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

  const codeState: FieldVisualState = isSuggestingCode
    ? "checking"
    : codeChecking
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
        className: iconInputClass(state),
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

  const hasImage =
    Boolean(selectedImage) ||
    (Boolean(previewUrl) && !removeImage && !imageBroken);

  const imageState: FieldVisualState = !imageTouched
    ? "neutral"
    : imageError || !hasImage
      ? "invalid"
      : "valid";

  const validateAndSetFile = (file: File | null) => {
    setImageTouched(true);
    setImageError(null);

    if (!file) {
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setImageError("Only JPEG, PNG, WebP, or GIF images are allowed.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError("Image must be 5MB or smaller.");
      return;
    }

    setSelectedImage(file);
    setRemoveImage(false);
  };

  const clearImage = () => {
    setImageTouched(true);
    setSelectedImage(null);
    setPreviewUrl(null);
    setRemoveImage(true);
    setImageBroken(false);
    setImageError(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <form
      onSubmit={handleSubmit(async (formValues) => {
        setImageTouched(true);

        if (!hasImage) {
          setImageError("Branch image is required.");
          return;
        }

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
          await onSubmit(
            {
              ...formValues,
              branchName: trimmedName,
              branchCode: trimmedCode,
            },
            selectedImage,
            removeImage,
          );
        } catch (error) {
          applyConflictFromError(error);
        }
      })}
      className="space-y-5"
      noValidate
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <IconField
          label="Branch Name"
          required
          state={nameState}
          errorMessage={
            nameAsyncError ?? errors.branchName?.message
          }
          successMessage="Available"
          icon={Tag}
        >
          <Input
            {...nameRegister}
            placeholder="Enter branch name"
            className={iconInputClass(nameState)}
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
        </IconField>

        <IconField
          label="Branch Code"
          required
          state={codeState}
          checkingMessage={isSuggestingCode ? "Generating code..." : undefined}
          errorMessage={
            codeAsyncError ?? errors.branchCode?.message
          }
          successMessage="Available"
          icon={Hash}
        >
          <Input
            {...codeRegister}
            readOnly
            placeholder="MCJB001"
            className={iconInputClass(codeState, "bg-slate-50")}
            onBlur={(event) => {
              codeRegister.onBlur(event);
              setCodeTouched(true);
              void trigger("branchCode");
            }}
          />
        </IconField>

        <IconField
          label="Email"
          required
          state={emailField.state}
          errorMessage={emailField.errorMessage}
          icon={Mail}
        >
          <Input
            {...emailField.inputProps}
            placeholder="Enter branch email"
          />
        </IconField>

        <IconField
          label="Phone"
          required
          state={phoneField.state}
          errorMessage={phoneField.errorMessage}
          icon={Phone}
        >
          <Input
            {...phoneField.inputProps}
            placeholder="Enter branch phone number"
          />
        </IconField>

        <IconField
          label="Address Line 1"
          required
          state={address1Field.state}
          errorMessage={address1Field.errorMessage}
          icon={MapPin}
        >
          <Input
            {...address1Field.inputProps}
            placeholder="Enter address line 1"
          />
        </IconField>

        <IconField
          label="Address Line 2"
          state="neutral"
          icon={MapPinned}
        >
          <Input
            {...register("addressLine2")}
            placeholder="Enter address line 2 (optional)"
            className={iconInputClass("neutral")}
          />
        </IconField>

        <IconField
          label="City"
          required
          state={cityField.state}
          errorMessage={cityField.errorMessage}
          icon={Building2}
        >
          <Input
            {...cityField.inputProps}
            placeholder="Enter city"
          />
        </IconField>

        <IconField
          label="State"
          required
          state={stateField.state}
          errorMessage={stateField.errorMessage}
          icon={Map}
        >
          <Input
            {...stateField.inputProps}
            placeholder="Enter state"
          />
        </IconField>

        <IconField
          label="Country"
          required
          state={countryField.state}
          errorMessage={countryField.errorMessage}
          icon={Globe}
        >
          <Input
            {...countryField.inputProps}
            placeholder="Enter country"
          />
        </IconField>

        <IconField
          label="Postal Code"
          required
          state={postalField.state}
          errorMessage={postalField.errorMessage}
          icon={MapPin}
        >
          <Input
            {...postalField.inputProps}
            placeholder="Enter postal code"
          />
        </IconField>

        <IconField
          label="Latitude"
          required
          state={latField.state}
          errorMessage={latField.errorMessage}
          icon={Compass}
        >
          <Input
            type="number"
            step="any"
            {...latField.inputProps}
            placeholder="Enter latitude"
          />
        </IconField>

        <IconField
          label="Longitude"
          required
          state={lngField.state}
          errorMessage={lngField.errorMessage}
          icon={Compass}
        >
          <Input
            type="number"
            step="any"
            {...lngField.inputProps}
            placeholder="Enter longitude"
          />
        </IconField>
      </div>

      <div>
        <Label>Description</Label>
        <div className="relative mt-1.5">
          <Textarea
            {...register("description")}
            placeholder="Enter branch description (optional)"
            className="min-h-[96px] pr-16"
          />
          <FileText
            className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
        </div>
        <FormError
          message={errors.description?.message}
        />
      </div>

      <div className="min-w-0">
        <Label required>Branch Image</Label>

        {previewUrl && !removeImage && !imageBroken ? (
          <div className="mb-3 flex items-start gap-3">
            <Image
              src={previewUrl}
              alt="Branch preview"
              width={112}
              height={112}
              className={`h-28 w-28 rounded-lg border object-cover ${
                imageState === "invalid"
                  ? "border-red-300"
                  : imageState === "valid"
                    ? "border-emerald-400"
                    : "border-slate-200"
              }`}
              onError={() => setImageBroken(true)}
            />

            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => fileInputRef.current?.click()}
              >
                Replace Image
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={clearImage}
              >
                <X className="mr-1 h-4 w-4" />
                Remove Image
              </Button>
            </div>
          </div>
        ) : (
          <div
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-8 text-center transition ${
              isDragging
                ? "border-blue-400 bg-blue-50/40"
                : imageState === "invalid"
                  ? "border-red-300 bg-red-50/30"
                  : imageState === "valid"
                    ? "border-emerald-400 bg-emerald-50/30"
                    : "border-slate-300 bg-white hover:border-slate-400"
            }`}
            onClick={() => !isSubmitting && fileInputRef.current?.click()}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              if (isSubmitting) {
                return;
              }
              validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
            }}
          >
            {imageBroken ? (
              <ImageIcon className="h-8 w-8 text-slate-400" />
            ) : (
              <Upload className="h-8 w-8 text-slate-400" />
            )}

            <p className="text-sm text-slate-600">
              Drag & drop image or choose image
            </p>
            <p className="text-xs text-slate-400">
              JPEG, PNG, WebP, GIF up to 5MB
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          disabled={isSubmitting}
          onChange={(event) => {
            validateAndSetFile(event.target.files?.[0] ?? null);
          }}
        />

        <div className="mt-1 min-h-[1.25rem]">
          {imageState === "invalid" && imageError ? (
            <p role="alert" className="text-sm text-red-500">
              {imageError}
            </p>
          ) : imageState === "valid" ? (
            <p className="text-xs text-emerald-600">Image ready</p>
          ) : null}
        </div>
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={
          isSubmitting ||
          isSuggestingCode ||
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

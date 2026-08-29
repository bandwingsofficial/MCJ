"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Calendar,
  FileText,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { ImageUploadField } from "@/src/shared/components/ui/image-upload-field";
import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import {
  DEFAULT_STUDENT_FORM_VALUES,
  STUDENT_GENDER_OPTIONS,
  STUDENT_STATUSES,
} from "@/src/features/students/constants/student.constants";
import {
  studentSchema,
  type StudentFormValues,
} from "@/src/features/students/schemas/student.schema";
import { studentService } from "@/src/features/students/services/student.service";
import { NOTES_MAX_LENGTH } from "@/src/features/students/utils/student-form.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

interface StudentFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<StudentFormValues>;
  profileImageUrl?: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  loadingLabel?: string;
  /** Server-side field errors (e.g. duplicate email). Preserves form values. */
  serverErrors?: Record<string, string>;
  onSubmit: (values: StudentFormValues, image: File | null) => Promise<void>;
  onCancel?: () => void;
}

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2";

function FieldIcon({
  icon: Icon,
  alignTop = false,
}: {
  icon: LucideIcon;
  alignTop?: boolean;
}) {
  return (
    <Icon
      className={cn(
        "pointer-events-none absolute right-9 z-[1] h-4 w-4 text-slate-400",
        alignTop ? "top-3" : "top-1/2 -translate-y-1/2",
      )}
      aria-hidden="true"
    />
  );
}

function iconInputClass(state: FieldVisualState, extra = "") {
  return cn(
    validatedFieldInputClass(state, "w-full min-w-0 max-w-full"),
    "pr-16",
    extra,
  );
}

function selectTriggerClass(state: FieldVisualState) {
  return iconInputClass(state, "pr-16");
}

function dateInputClass(state: FieldVisualState) {
  return validatedFieldInputClass(state, "w-full min-w-0 max-w-full");
}

type SyncFieldName = keyof StudentFormValues;

export function StudentForm({
  mode,
  defaultValues,
  profileImageUrl,
  isSubmitting,
  submitLabel,
  loadingLabel,
  serverErrors,
  onCancel,
  onSubmit,
}: StudentFormProps) {
  const isEdit = mode === "edit";
  const suggestRequestIdRef = useRef(0);

  const [isSuggestingCode, setIsSuggestingCode] = useState(false);
  const [suggestedCode, setSuggestedCode] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    profileImageUrl ?? null,
  );

  const mergedDefaults = useMemo(
    () => ({
      ...DEFAULT_STUDENT_FORM_VALUES,
      ...defaultValues,
    }),
    [defaultValues],
  );

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    reset,
    trigger,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: mergedDefaults,
  });

  useEffect(() => {
    if (!serverErrors || Object.keys(serverErrors).length === 0) {
      return;
    }

    for (const [field, message] of Object.entries(serverErrors)) {
      if (!message?.trim()) continue;
      setError(field as keyof StudentFormValues, {
        type: "server",
        message,
      });
    }
  }, [serverErrors, setError]);

  const values = watch();
  const notesLength = (values.notes ?? "").length;
  const studentCode = isEdit
    ? values.studentCode || suggestedCode
    : suggestedCode;

  useEffect(() => {
    reset(mergedDefaults);
    setPreviewUrl(profileImageUrl ?? null);
    setSelectedImage(null);
    if (isEdit && defaultValues?.studentCode) {
      setSuggestedCode(defaultValues.studentCode);
    }
  }, [mergedDefaults, reset, profileImageUrl, isEdit, defaultValues?.studentCode]);

  useEffect(() => {
    if (isEdit) {
      return;
    }

    const requestId = ++suggestRequestIdRef.current;
    let cancelled = false;

    const loadSuggestedCode = async () => {
      try {
        setIsSuggestingCode(true);
        const response = await studentService.suggestStudentCode();

        if (cancelled || requestId !== suggestRequestIdRef.current) {
          return;
        }

        const code = response.data.studentCode;
        setSuggestedCode(code);
        setValue("studentCode", code, {
          shouldDirty: false,
          shouldValidate: false,
        });
      } catch {
        // Suggestion is UX-only.
      } finally {
        if (!cancelled && requestId === suggestRequestIdRef.current) {
          setIsSuggestingCode(false);
        }
      }
    };

    void loadSuggestedCode();

    return () => {
      cancelled = true;
    };
  }, [isEdit, setValue]);

  const getFieldState = (
    name: SyncFieldName,
    options?: { forceValid?: boolean },
  ): FieldVisualState => {
    if (name === "studentCode" && isSuggestingCode) {
      return "checking";
    }

    if (options?.forceValid) {
      const raw = values[name];
      const hasValue =
        typeof raw === "string"
          ? raw.trim().length > 0
          : raw !== undefined && raw !== null;

      if (hasValue && !errors[name]) {
        return "valid";
      }
    }

    const interacted =
      isEdit ||
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
      if (
        name === "lastName" ||
        name === "email" ||
        name === "phone" ||
        name === "dateOfBirth" ||
        name === "admissionDate" ||
        name === "notes" ||
        name === "addressLine1" ||
        name === "addressLine2" ||
        name === "city" ||
        name === "state" ||
        name === "country" ||
        name === "postalCode" ||
        name === "qualification" ||
        name === "collegeName" ||
        name === "specialization" ||
        name === "parentName" ||
        name === "parentPhone" ||
        name === "emergencyContactName" ||
        name === "emergencyContactPhone"
      ) {
        return "neutral";
      }

      return "invalid";
    }

    return "valid";
  };

  const inputClass = (
    name: SyncFieldName,
    options?: { forceValid?: boolean },
  ) => iconInputClass(getFieldState(name, options));

  const registerField = (name: SyncFieldName) => {
    const registration = register(name);

    return {
      ...registration,
      className: inputClass(name),
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        registration.onBlur(event);
        void trigger(name);
      },
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        registration.onChange(event);
        void trigger(name);
      },
    };
  };

  const registerDateField = (name: SyncFieldName) => {
    const registration = register(name);

    return {
      ...registration,
      className: dateInputClass(getFieldState(name)),
      onBlur: (event: FocusEvent<HTMLInputElement>) => {
        registration.onBlur(event);
        void trigger(name);
      },
      onChange: (event: ChangeEvent<HTMLInputElement>) => {
        registration.onChange(event);
        void trigger(name);
      },
    };
  };

  const handleFormSubmit = handleSubmit(async (formValues) => {
    await onSubmit(formValues, selectedImage);
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      className="flex min-h-0 flex-1 flex-col"
      autoComplete="off"
    >
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pr-1">
        <div className={GRID_CLASS}>
          <div className="md:col-span-2">
            <ValidatedField
              label="Profile Image"
              state={getFieldState("profileImageFileId")}
            >
              <ImageUploadField
                previewUrl={previewUrl}
                file={selectedImage}
                disabled={isSubmitting}
                state={getFieldState("profileImageFileId")}
                onFileSelect={(file) => {
                  setSelectedImage(file);
                  if (!file) {
                    setPreviewUrl(profileImageUrl ?? null);
                  }
                }}
                onRemove={() => {
                  setSelectedImage(null);
                  setPreviewUrl(profileImageUrl ?? null);
                }}
              />
            </ValidatedField>
          </div>

          <ValidatedField
            label="Student Code"
            state={getFieldState("studentCode", { forceValid: true })}
            checkingMessage="Generating code..."
          >
            <div className="relative">
              <Input
                readOnly
                value={studentCode}
                placeholder="STU0001"
                autoComplete="off"
                className={cn(
                  iconInputClass(
                    getFieldState("studentCode", { forceValid: true }),
                  ),
                  "bg-slate-50",
                )}
              />
              <FieldIcon icon={Hash} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="First Name"
            required
            state={getFieldState("firstName")}
            errorMessage={errors.firstName?.message}
          >
            <div className="relative">
              <Input
                placeholder="Enter first name"
                autoComplete="off"
                {...registerField("firstName")}
              />
              <FieldIcon icon={User} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Last Name"
            state={getFieldState("lastName")}
            errorMessage={errors.lastName?.message}
          >
            <div className="relative">
              <Input
                placeholder="Enter last name"
                autoComplete="off"
                {...registerField("lastName")}
              />
              <FieldIcon icon={User} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Email"
            state={getFieldState("email")}
            errorMessage={errors.email?.message}
          >
            <div className="relative">
              <Input
                type="email"
                placeholder="Enter email"
                autoComplete="off"
                {...registerField("email")}
              />
              <FieldIcon icon={Mail} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Phone"
            state={getFieldState("phone")}
            errorMessage={errors.phone?.message}
          >
            <div className="relative">
              <Input
                placeholder="Enter phone"
                autoComplete="off"
                {...registerField("phone")}
              />
              <FieldIcon icon={Phone} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Gender"
            state={getFieldState("gender")}
            errorMessage={errors.gender?.message}
          >
            <div className="relative">
              <AppSelect
                value={values.gender}
                onValueChange={(value) =>
                  setValue("gender", value as StudentFormValues["gender"], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                options={uniqueSelectOptions([...STUDENT_GENDER_OPTIONS])}
                triggerClassName={selectTriggerClass(getFieldState("gender"))}
              />
              <FieldIcon icon={Users} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Date of Birth"
            state={getFieldState("dateOfBirth")}
            errorMessage={errors.dateOfBirth?.message}
          >
            <Input
              type="date"
              autoComplete="off"
              {...registerDateField("dateOfBirth")}
            />
          </ValidatedField>

          <ValidatedField
            label="Qualification"
            state={getFieldState("qualification")}
            errorMessage={errors.qualification?.message}
          >
            <div className="relative">
              <Input
                placeholder="Qualification"
                autoComplete="off"
                {...registerField("qualification")}
              />
              <FieldIcon icon={GraduationCap} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="College Name"
            state={getFieldState("collegeName")}
            errorMessage={errors.collegeName?.message}
          >
            <div className="relative">
              <Input
                placeholder="College name"
                autoComplete="off"
                {...registerField("collegeName")}
              />
              <FieldIcon icon={GraduationCap} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Specialization"
            state={getFieldState("specialization")}
            errorMessage={errors.specialization?.message}
          >
            <div className="relative">
              <Input
                placeholder="Specialization"
                autoComplete="off"
                {...registerField("specialization")}
              />
              <FieldIcon icon={GraduationCap} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Passing Year"
            state={getFieldState("passingYear")}
            errorMessage={errors.passingYear?.message}
          >
            <div className="relative">
              <Input
                type="number"
                autoComplete="off"
                {...register("passingYear", { valueAsNumber: true })}
                className={inputClass("passingYear")}
              />
              <FieldIcon icon={Calendar} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Address Line 1"
            state={getFieldState("addressLine1")}
            errorMessage={errors.addressLine1?.message}
          >
            <div className="relative">
              <Input
                placeholder="Address line 1"
                autoComplete="off"
                {...registerField("addressLine1")}
              />
              <FieldIcon icon={MapPin} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Address Line 2"
            state={getFieldState("addressLine2")}
            errorMessage={errors.addressLine2?.message}
          >
            <div className="relative">
              <Input
                placeholder="Address line 2"
                autoComplete="off"
                {...registerField("addressLine2")}
              />
              <FieldIcon icon={MapPin} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="City"
            state={getFieldState("city")}
            errorMessage={errors.city?.message}
          >
            <div className="relative">
              <Input
                placeholder="City"
                autoComplete="off"
                {...registerField("city")}
              />
              <FieldIcon icon={MapPin} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="State"
            state={getFieldState("state")}
            errorMessage={errors.state?.message}
          >
            <div className="relative">
              <Input
                placeholder="State"
                autoComplete="off"
                {...registerField("state")}
              />
              <FieldIcon icon={MapPin} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Country"
            state={getFieldState("country")}
            errorMessage={errors.country?.message}
          >
            <div className="relative">
              <Input
                placeholder="Country"
                autoComplete="off"
                {...registerField("country")}
              />
              <FieldIcon icon={MapPin} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Postal Code"
            state={getFieldState("postalCode")}
            errorMessage={errors.postalCode?.message}
          >
            <div className="relative">
              <Input
                placeholder="Postal code"
                autoComplete="off"
                {...registerField("postalCode")}
              />
              <FieldIcon icon={MapPin} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Parent Name"
            state={getFieldState("parentName")}
            errorMessage={errors.parentName?.message}
          >
            <div className="relative">
              <Input
                placeholder="Parent name"
                autoComplete="off"
                {...registerField("parentName")}
              />
              <FieldIcon icon={User} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Parent Phone"
            state={getFieldState("parentPhone")}
            errorMessage={errors.parentPhone?.message}
          >
            <div className="relative">
              <Input
                placeholder="Parent phone"
                autoComplete="off"
                {...registerField("parentPhone")}
              />
              <FieldIcon icon={Phone} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Emergency Contact Name"
            state={getFieldState("emergencyContactName")}
            errorMessage={errors.emergencyContactName?.message}
          >
            <div className="relative">
              <Input
                placeholder="Emergency contact name"
                autoComplete="off"
                {...registerField("emergencyContactName")}
              />
              <FieldIcon icon={User} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Emergency Contact Phone"
            state={getFieldState("emergencyContactPhone")}
            errorMessage={errors.emergencyContactPhone?.message}
          >
            <div className="relative">
              <Input
                placeholder="Emergency contact phone"
                autoComplete="off"
                {...registerField("emergencyContactPhone")}
              />
              <FieldIcon icon={Phone} />
            </div>
          </ValidatedField>

          <ValidatedField
            label="Admission Date"
            state={getFieldState("admissionDate")}
            errorMessage={errors.admissionDate?.message}
          >
            <Input
              type="date"
              autoComplete="off"
              {...registerDateField("admissionDate")}
            />
          </ValidatedField>

          <ValidatedField
            label="Status"
            state={getFieldState("status")}
            errorMessage={errors.status?.message}
          >
            <div className="relative">
              <AppSelect
                value={values.status}
                onValueChange={(value) =>
                  setValue("status", value as StudentFormValues["status"], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                options={uniqueSelectOptions([...STUDENT_STATUSES])}
                triggerClassName={selectTriggerClass(getFieldState("status"))}
              />
              <FieldIcon icon={FileText} />
            </div>
          </ValidatedField>

          <div className="md:col-span-2">
            <ValidatedField
              label="Notes"
              state={getFieldState("notes")}
              errorMessage={errors.notes?.message}
            >
              <div className="relative">
                <Textarea
                  placeholder="Notes"
                  rows={4}
                  autoComplete="off"
                  {...register("notes")}
                  className={cn(inputClass("notes"), "pr-16")}
                />
                <FieldIcon icon={FileText} alignTop />
              </div>
              <p
                className={`mt-1 text-right text-xs tabular-nums ${
                  notesLength > NOTES_MAX_LENGTH
                    ? "text-red-600"
                    : "text-slate-500"
                }`}
              >
                {Math.min(notesLength, NOTES_MAX_LENGTH)}/{NOTES_MAX_LENGTH}{" "}
                characters
              </p>
            </ValidatedField>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 mt-4 flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-white pt-4">
        {onCancel ? (
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
        ) : null}
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? loadingLabel ?? submitLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}

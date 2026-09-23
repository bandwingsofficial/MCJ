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
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { ImageUploadField } from "@/src/shared/components/ui/image-upload-field";
import {
  IconValidatedField,
  iconDecorInputClass,
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { buildStudentQualificationSelectOptions } from "@mcj/shared-constants";

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

function iconInputClass(state: FieldVisualState, extra = "") {
  return iconDecorInputClass(state, cn("w-full min-w-0 max-w-full", extra));
}

function selectTriggerClass(state: FieldVisualState) {
  return validatedFieldInputClass(state, "w-full min-w-0 max-w-full", {
    leftIcon: true,
    select: true,
  });
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
      className: iconInputClass(getFieldState(name)),
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

          <IconValidatedField
            label="Student Code"
            state={getFieldState("studentCode", { forceValid: true })}
            checkingMessage="Generating code..."
           icon={Hash}>
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
          </IconValidatedField>

          <IconValidatedField
            label="First Name"
            required
            state={getFieldState("firstName")}
            errorMessage={errors.firstName?.message}
           icon={User}>
              <Input
                placeholder="Enter first name"
                autoComplete="off"
                {...registerField("firstName")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Last Name"
            state={getFieldState("lastName")}
            errorMessage={errors.lastName?.message}
           icon={User}>
              <Input
                placeholder="Enter last name"
                autoComplete="off"
                {...registerField("lastName")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Email"
            state={getFieldState("email")}
            errorMessage={errors.email?.message}
           icon={Mail}>
              <Input
                type="email"
                placeholder="Enter email"
                autoComplete="off"
                {...registerField("email")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Phone"
            state={getFieldState("phone")}
            errorMessage={errors.phone?.message}
           icon={Phone}>
              <Input
                placeholder="Enter phone"
                autoComplete="off"
                {...registerField("phone")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Gender"
            state={getFieldState("gender")}
            errorMessage={errors.gender?.message}
           select icon={Users}>
              <AppSelect
                value={values.gender}
                placeholder="Select gender"
                onValueChange={(value) =>
                  setValue("gender", value as StudentFormValues["gender"], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                options={uniqueSelectOptions([...STUDENT_GENDER_OPTIONS])}
                triggerClassName={selectTriggerClass(getFieldState("gender"))}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Date of Birth"
            icon={Calendar}
            state={getFieldState("dateOfBirth")}
            errorMessage={errors.dateOfBirth?.message}
          >
            <Input
              type="date"
              autoComplete="off"
              {...registerDateField("dateOfBirth")}
            />
          </IconValidatedField>

          <IconValidatedField
            label="Qualification"
            state={getFieldState("qualification")}
            errorMessage={errors.qualification?.message}
           select icon={GraduationCap}>
              <AppSelect
                value={values.qualification || undefined}
                placeholder="Select qualification"
                onValueChange={(value) =>
                  setValue("qualification", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                options={buildStudentQualificationSelectOptions(
                  values.qualification,
                )}
                triggerClassName={selectTriggerClass(
                  getFieldState("qualification"),
                )}
              />
          </IconValidatedField>

          <IconValidatedField
            label="College Name"
            state={getFieldState("collegeName")}
            errorMessage={errors.collegeName?.message}
           icon={GraduationCap}>
              <Input
                placeholder="College name"
                autoComplete="off"
                {...registerField("collegeName")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Specialization"
            state={getFieldState("specialization")}
            errorMessage={errors.specialization?.message}
           icon={GraduationCap}>
              <Input
                placeholder="Specialization"
                autoComplete="off"
                {...registerField("specialization")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Passing Year"
            state={getFieldState("passingYear")}
            errorMessage={errors.passingYear?.message}
           icon={Calendar}>
              <Input
                type="number"
                autoComplete="off"
                {...register("passingYear", { valueAsNumber: true })}
                className={inputClass("passingYear")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Address Line 1"
            state={getFieldState("addressLine1")}
            errorMessage={errors.addressLine1?.message}
           icon={MapPin}>
              <Input
                placeholder="Address line 1"
                autoComplete="off"
                {...registerField("addressLine1")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Address Line 2"
            state={getFieldState("addressLine2")}
            errorMessage={errors.addressLine2?.message}
           icon={MapPin}>
              <Input
                placeholder="Address line 2"
                autoComplete="off"
                {...registerField("addressLine2")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="City"
            state={getFieldState("city")}
            errorMessage={errors.city?.message}
           icon={MapPin}>
              <Input
                placeholder="City"
                autoComplete="off"
                {...registerField("city")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="State"
            state={getFieldState("state")}
            errorMessage={errors.state?.message}
           icon={MapPin}>
              <Input
                placeholder="State"
                autoComplete="off"
                {...registerField("state")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Country"
            state={getFieldState("country")}
            errorMessage={errors.country?.message}
           icon={MapPin}>
              <Input
                placeholder="Country"
                autoComplete="off"
                {...registerField("country")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Postal Code"
            state={getFieldState("postalCode")}
            errorMessage={errors.postalCode?.message}
           icon={MapPin}>
              <Input
                placeholder="Postal code"
                autoComplete="off"
                {...registerField("postalCode")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Parent Name"
            state={getFieldState("parentName")}
            errorMessage={errors.parentName?.message}
           icon={User}>
              <Input
                placeholder="Parent name"
                autoComplete="off"
                {...registerField("parentName")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Parent Phone"
            state={getFieldState("parentPhone")}
            errorMessage={errors.parentPhone?.message}
           icon={Phone}>
              <Input
                placeholder="Parent phone"
                autoComplete="off"
                {...registerField("parentPhone")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Emergency Contact Name"
            state={getFieldState("emergencyContactName")}
            errorMessage={errors.emergencyContactName?.message}
           icon={User}>
              <Input
                placeholder="Emergency contact name"
                autoComplete="off"
                {...registerField("emergencyContactName")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Emergency Contact Phone"
            state={getFieldState("emergencyContactPhone")}
            errorMessage={errors.emergencyContactPhone?.message}
           icon={Phone}>
              <Input
                placeholder="Emergency contact phone"
                autoComplete="off"
                {...registerField("emergencyContactPhone")}
              />
          </IconValidatedField>

          <IconValidatedField
            label="Admission Date"
            icon={Calendar}
            state={getFieldState("admissionDate")}
            errorMessage={errors.admissionDate?.message}
          >
            <Input
              type="date"
              autoComplete="off"
              {...registerDateField("admissionDate")}
            />
          </IconValidatedField>

          <IconValidatedField
            label="Status"
            state={getFieldState("status")}
            errorMessage={errors.status?.message}
           select icon={FileText}>
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
          </IconValidatedField>

          <div className="md:col-span-2">
            <IconValidatedField
              label="Notes"
              icon={FileText}
              textarea
              state={getFieldState("notes")}
              errorMessage={errors.notes?.message}
            >
              <Textarea
                placeholder="Add notes about this student"
                rows={4}
                autoComplete="off"
                {...register("notes")}
                className={cn(inputClass("notes"), "min-h-[96px] resize-y")}
              />
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
            </IconValidatedField>
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

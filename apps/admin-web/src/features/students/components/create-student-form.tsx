"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
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
  IconValidatedField,
  iconDecorInputClass,
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import { buildStudentQualificationSelectOptions } from "@mcj/shared-constants";

import {
  DEFAULT_CREATE_STUDENT_FORM_VALUES,
  STUDENT_GENDER_OPTIONS,
  STUDENT_STATUSES,
} from "@/src/features/students/constants/student.constants";
import {
  createStudentSchema,
  type CreateStudentFormValues,
} from "@/src/features/students/schemas/create-student.schema";
import { studentService } from "@/src/features/students/services/student.service";
import { NOTES_MAX_LENGTH } from "@/src/features/students/utils/student-form.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

interface CreateStudentFormProps {
  isSubmitting: boolean;
  serverErrors?: Record<string, string>;
  onSubmit: (values: CreateStudentFormValues, image: File | null) => Promise<void>;
  onCancel?: () => void;
}

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2";

type FieldName = keyof CreateStudentFormValues;

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-[#F6F9FD] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#102A56]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-[#647A9B]">{description}</p>
        ) : null}
      </header>
      <div className={cn(GRID_CLASS, "p-4")}>{children}</div>
    </section>
  );
}

function iconInputClass(state: FieldVisualState, extra = "") {
  return iconDecorInputClass(state, cn("w-full min-w-0 max-w-full", extra));
}

function selectTriggerClass(state: FieldVisualState) {
  return validatedFieldInputClass(state, "w-full min-w-0 max-w-full", {
    leftIcon: true,
    select: true,
  });
}

export function CreateStudentForm({
  isSubmitting,
  serverErrors,
  onCancel,
  onSubmit,
}: CreateStudentFormProps) {
  const suggestRequestIdRef = useRef(0);
  const [isSuggestingCode, setIsSuggestingCode] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const selectedImageRef = useRef<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    trigger,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<CreateStudentFormValues>({
    resolver: zodResolver(createStudentSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: DEFAULT_CREATE_STUDENT_FORM_VALUES,
  });

  useEffect(() => {
    if (!serverErrors || Object.keys(serverErrors).length === 0) {
      return;
    }

    for (const [field, message] of Object.entries(serverErrors)) {
      if (!message?.trim()) continue;
      setError(field as FieldName, {
        type: "server",
        message,
      });
    }
  }, [serverErrors, setError]);

  const values = watch();
  const notesLength = (values.notes ?? "").length;

  useEffect(() => {
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
        setStudentId(code);
        setValue("studentCode", code, {
          shouldDirty: false,
          shouldValidate: false,
        });
      } catch {
        // Suggestion is UX-only; server generates on create.
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
  }, [setValue]);

  const getFieldState = (
    name: FieldName,
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
        name === "parentPhone"
      ) {
        return "neutral";
      }

      return "invalid";
    }

    return "valid";
  };

  const inputClass = (
    name: FieldName,
    options?: { forceValid?: boolean },
  ) => iconInputClass(getFieldState(name, options));

  const registerField = (name: FieldName) => {
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

  const registerDateField = (name: FieldName) => {
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

  return (
    <form
      onSubmit={handleSubmit(async (formValues) => {
        await onSubmit(formValues, selectedImageRef.current);
      })}
      className="flex min-h-0 flex-1 flex-col"
      autoComplete="off"
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <FormSection
          title="Student Identity"
          description="Basic profile details and status for the new student."
        >
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
                  selectedImageRef.current = file;
                  setSelectedImage(file);
                  if (!file) {
                    setPreviewUrl(null);
                  }
                }}
                onRemove={() => {
                  setSelectedImage(null);
                  selectedImageRef.current = null;
                  setPreviewUrl(null);
                }}
              />
            </ValidatedField>
          </div>

          <IconValidatedField
            label="Student ID"
            icon={Hash}
            state={getFieldState("studentCode", { forceValid: true })}
            checkingMessage="Generating ID..."
          >
            <Input
              readOnly
              tabIndex={-1}
              value={studentId}
              placeholder="MCJ-STU-001"
              autoComplete="off"
              className={cn(
                iconInputClass(
                  getFieldState("studentCode", { forceValid: true }),
                ),
                "cursor-default bg-slate-50",
              )}
            />
            <p className="mt-1 text-[11px] text-[#8AA0BB]">Auto-generated</p>
          </IconValidatedField>

          <IconValidatedField
            label="Status"
            select
            icon={FileText}
            state={getFieldState("status")}
            errorMessage={errors.status?.message}
          >
            <AppSelect
              value={values.status}
              placeholder="Select status"
              onValueChange={(value) =>
                setValue("status", value as CreateStudentFormValues["status"], {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={uniqueSelectOptions([...STUDENT_STATUSES])}
              triggerClassName={selectTriggerClass(getFieldState("status"))}
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
            label="Gender"
            state={getFieldState("gender")}
            errorMessage={errors.gender?.message}
           select icon={Users}>
              <AppSelect
                value={values.gender}
                onValueChange={(value) =>
                  setValue("gender", value as CreateStudentFormValues["gender"], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
                options={uniqueSelectOptions([...STUDENT_GENDER_OPTIONS])}
                triggerClassName={selectTriggerClass(getFieldState("gender"))}
              />
          </IconValidatedField>

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
        </FormSection>

        <FormSection
          title="Contact Information"
          description="Primary email and phone details."
        >
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
        </FormSection>

        <FormSection
          title="Education"
          description="Academic background and specialization."
        >
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
        </FormSection>

        <FormSection
          title="Address"
          description="Residential address details."
        >
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
        </FormSection>

        <FormSection
          title="Parent / Guardian"
          description="Primary parent or guardian contact."
        >
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
        </FormSection>

        <FormSection title="Additional Notes" description="Optional internal notes.">
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
        </FormSection>
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
          {isSubmitting ? "Creating Student..." : "Create Student"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import {
  useEffect,
  useMemo,
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
  ValidatedField,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import {
  LeftIconField,
  leftIconInputClass,
  selectTriggerClass,
} from "@/src/features/students/utils/student-form-field-ui";
import {
  STUDENT_PROFILE_IMAGE_ACCEPT,
  validateStudentProfileImage,
} from "@/src/features/students/utils/student-profile-image.util";
import { cn } from "@/src/shared/lib/cn";

import { buildStudentQualificationSelectOptions } from "@mcj/shared-constants";

import {
  DEFAULT_CREATE_STUDENT_FORM_VALUES,
  STUDENT_GENDER_OPTIONS,
} from "@/src/features/students/constants/student.constants";
import { getStudentStatusSelectOptions } from "@/src/features/students/utils/student-workflow-status.utils";
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
  onSubmit: (
    values: CreateStudentFormValues,
    image: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
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
  const statusOptions = useMemo(
    () => getStudentStatusSelectOptions(values.status ?? "LEAD"),
    [values.status],
  );
  const notesLength = (values.notes ?? "").length;
  const passingYearRegister = register("passingYear", {
    valueAsNumber: true,
  });

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

    if (typeof raw === "number" && Number.isNaN(raw)) {
      return "neutral";
    }

    if (typeof raw === "string" && raw.trim() === "") {
      if (
        name === "lastName" ||
        name === "dateOfBirth" ||
        name === "gender" ||
        name === "passingYear" ||
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
  ) => leftIconInputClass(getFieldState(name, options));

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
      className: leftIconInputClass(getFieldState(name)),
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
        await onSubmit(formValues, selectedImageRef.current, false);
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
              label="Profile Image (Optional)"
              state={getFieldState("profileImageFileId")}
            >
              <ImageUploadField
                previewUrl={previewUrl}
                file={selectedImage}
                disabled={isSubmitting}
                entityLabel="student"
                accept={STUDENT_PROFILE_IMAGE_ACCEPT}
                validateFile={validateStudentProfileImage}
                error={serverErrors?.profileImage ?? null}
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

          <LeftIconField
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
                leftIconInputClass(
                  getFieldState("studentCode", { forceValid: true }),
                ),
                "cursor-default bg-slate-50",
              )}
            />
            <p className="mt-1 text-[11px] text-[#8AA0BB]">Auto-generated</p>
          </LeftIconField>

          <LeftIconField
            label="Status"
            required
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
              options={uniqueSelectOptions(statusOptions)}
              triggerClassName={selectTriggerClass(getFieldState("status"))}
            />
          </LeftIconField>

          <LeftIconField
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
          </LeftIconField>

          <LeftIconField
            label="Last Name (Optional)"
            state={getFieldState("lastName")}
            errorMessage={errors.lastName?.message}
           icon={User}>
              <Input
                placeholder="Enter last name"
                autoComplete="off"
                {...registerField("lastName")}
              />
          </LeftIconField>

          <LeftIconField
            label="Gender (Optional)"
            state={getFieldState("gender")}
            errorMessage={errors.gender?.message}
            select
            icon={Users}
          >
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
          </LeftIconField>

          <LeftIconField
            label="Date of Birth (Optional)"
            state={getFieldState("dateOfBirth")}
            errorMessage={errors.dateOfBirth?.message}
            icon={Calendar}
          >
            <Input
              type="date"
              autoComplete="off"
              {...registerDateField("dateOfBirth")}
            />
          </LeftIconField>
        </FormSection>

        <FormSection
          title="Contact Information"
          description="Primary email and phone details."
        >
          <LeftIconField
            label="Email"
            required
            state={getFieldState("email")}
            errorMessage={errors.email?.message}
           icon={Mail}>
              <Input
                type="email"
                placeholder="Enter email"
                autoComplete="off"
                {...registerField("email")}
              />
          </LeftIconField>

          <LeftIconField
            label="Phone"
            required
            state={getFieldState("phone")}
            errorMessage={errors.phone?.message}
           icon={Phone}>
              <Input
                placeholder="Enter phone"
                autoComplete="off"
                {...registerField("phone")}
              />
          </LeftIconField>
        </FormSection>

        <FormSection
          title="Education"
          description="Academic background and specialization."
        >
          <LeftIconField
            label="Qualification (Optional)"
            state={getFieldState("qualification")}
            errorMessage={errors.qualification?.message}
            select
            icon={GraduationCap}
          >
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
          </LeftIconField>

          <LeftIconField
            label="College Name (Optional)"
            state={getFieldState("collegeName")}
            errorMessage={errors.collegeName?.message}
           icon={GraduationCap}>
              <Input
                placeholder="College name"
                autoComplete="off"
                {...registerField("collegeName")}
              />
          </LeftIconField>

          <LeftIconField
            label="Specialization (Optional)"
            state={getFieldState("specialization")}
            errorMessage={errors.specialization?.message}
           icon={GraduationCap}>
              <Input
                placeholder="Specialization"
                autoComplete="off"
                {...registerField("specialization")}
              />
          </LeftIconField>

          <LeftIconField
            label="Passing Year (Optional)"
            state={getFieldState("passingYear")}
            errorMessage={errors.passingYear?.message}
           icon={Calendar}>
              <Input
                type="number"
                autoComplete="off"
                {...passingYearRegister}
                className={inputClass("passingYear")}
                onBlur={(event) => {
                  passingYearRegister.onBlur(event);
                  void trigger("passingYear");
                }}
                onChange={(event) => {
                  passingYearRegister.onChange(event);
                  void trigger("passingYear");
                }}
              />
          </LeftIconField>
        </FormSection>

        <FormSection
          title="Address"
          description="Residential address details."
        >
          <LeftIconField
            label="Address Line 1 (Optional)"
            state={getFieldState("addressLine1")}
            errorMessage={errors.addressLine1?.message}
           icon={MapPin}>
              <Input
                placeholder="Address line 1"
                autoComplete="off"
                {...registerField("addressLine1")}
              />
          </LeftIconField>

          <LeftIconField
            label="Address Line 2 (Optional)"
            state={getFieldState("addressLine2")}
            errorMessage={errors.addressLine2?.message}
           icon={MapPin}>
              <Input
                placeholder="Address line 2"
                autoComplete="off"
                {...registerField("addressLine2")}
              />
          </LeftIconField>

          <LeftIconField
            label="City (Optional)"
            state={getFieldState("city")}
            errorMessage={errors.city?.message}
           icon={MapPin}>
              <Input
                placeholder="City"
                autoComplete="off"
                {...registerField("city")}
              />
          </LeftIconField>

          <LeftIconField
            label="State (Optional)"
            state={getFieldState("state")}
            errorMessage={errors.state?.message}
           icon={MapPin}>
              <Input
                placeholder="State"
                autoComplete="off"
                {...registerField("state")}
              />
          </LeftIconField>

          <LeftIconField
            label="Country (Optional)"
            state={getFieldState("country")}
            errorMessage={errors.country?.message}
           icon={MapPin}>
              <Input
                placeholder="Country"
                autoComplete="off"
                {...registerField("country")}
              />
          </LeftIconField>

          <LeftIconField
            label="Postal Code (Optional)"
            state={getFieldState("postalCode")}
            errorMessage={errors.postalCode?.message}
           icon={MapPin}>
              <Input
                placeholder="Postal code"
                autoComplete="off"
                {...registerField("postalCode")}
              />
          </LeftIconField>
        </FormSection>

        <FormSection
          title="Parent / Guardian"
          description="Primary parent or guardian contact."
        >
          <LeftIconField
            label="Parent Name (Optional)"
            state={getFieldState("parentName")}
            errorMessage={errors.parentName?.message}
           icon={User}>
              <Input
                placeholder="Parent name"
                autoComplete="off"
                {...registerField("parentName")}
              />
          </LeftIconField>

          <LeftIconField
            label="Parent Phone (Optional)"
            state={getFieldState("parentPhone")}
            errorMessage={errors.parentPhone?.message}
           icon={Phone}>
              <Input
                placeholder="Parent phone"
                autoComplete="off"
                {...registerField("parentPhone")}
              />
          </LeftIconField>
        </FormSection>

        <FormSection title="Additional Notes" description="Optional internal notes.">
          <div className="md:col-span-2">
            <LeftIconField
              label="Notes (Optional)"
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
                className={cn(
                  leftIconInputClass(getFieldState("notes"), "min-h-[96px] resize-y", {
                    textarea: true,
                  }),
                  "resize-y",
                )}
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
            </LeftIconField>
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

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
import { Loader } from "lucide-react";

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
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

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
import type { BranchOption } from "@/src/features/students/types/student.types";
import { NOTES_MAX_LENGTH } from "@/src/features/students/utils/student-form.utils";
import { uniqueSelectOptions } from "@/src/features/students/utils/student-select.utils";

interface StudentFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<StudentFormValues>;
  profileImageUrl?: string | null;
  isSubmitting: boolean;
  submitLabel: string;
  loadingLabel?: string;
  onSubmit: (values: StudentFormValues, image: File | null) => Promise<void>;
  onCancel?: () => void;
}

const GRID_CLASS = "grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2";

type SyncFieldName = keyof StudentFormValues;

export function StudentForm({
  mode,
  defaultValues,
  profileImageUrl,
  isSubmitting,
  submitLabel,
  loadingLabel,
  onCancel,
  onSubmit,
}: StudentFormProps) {
  const isEdit = mode === "edit";
  const suggestRequestIdRef = useRef(0);

  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
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
    const loadOptions = async () => {
      setIsLoadingOptions(true);

      try {
        const branchItems = await studentService.getBranches();
        setBranches(branchItems);
      } catch (error) {
        appToast.error(getErrorMessage(error));
      } finally {
        setIsLoadingOptions(false);
      }
    };

    void loadOptions();
  }, []);

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
  ) => validatedFieldInputClass(getFieldState(name, options));

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

  const selectClass = (name: SyncFieldName) =>
    validatedFieldInputClass(getFieldState(name), "w-full min-w-0");

  const branchOptions = uniqueSelectOptions(
    branches.map((branch) => ({
      label: `${branch.branchName} (${branch.branchCode})`,
      value: branch.id,
    })),
  );

  const handleFormSubmit = handleSubmit(async (formValues) => {
    await onSubmit(formValues, selectedImage);
  });

  if (isLoadingOptions) {
    return (
      <div className="flex justify-center py-10">
        <Loader className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

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
            <Input
              readOnly
              value={studentCode}
              placeholder="STU0001"
              autoComplete="off"
              className={validatedFieldInputClass(
                getFieldState("studentCode", { forceValid: true }),
                "bg-slate-50",
              )}
            />
          </ValidatedField>

          <ValidatedField
            label="Branch"
            required
            state={getFieldState("branchId")}
            errorMessage={errors.branchId?.message}
          >
            <AppSelect
              value={values.branchId?.trim() ? values.branchId : undefined}
              placeholder="Select branch"
              onValueChange={(value) => {
                setValue("branchId", value, {
                  shouldValidate: true,
                  shouldDirty: true,
                });
              }}
              options={branchOptions}
              triggerClassName={selectClass("branchId")}
            />
          </ValidatedField>

          <ValidatedField
            label="First Name"
            required
            state={getFieldState("firstName")}
            errorMessage={errors.firstName?.message}
          >
            <Input
              placeholder="Enter first name"
              autoComplete="off"
              {...registerField("firstName")}
            />
          </ValidatedField>

          <ValidatedField
            label="Last Name"
            state={getFieldState("lastName")}
            errorMessage={errors.lastName?.message}
          >
            <Input
              placeholder="Enter last name"
              autoComplete="off"
              {...registerField("lastName")}
            />
          </ValidatedField>

          <ValidatedField
            label="Email"
            state={getFieldState("email")}
            errorMessage={errors.email?.message}
          >
            <Input
              type="email"
              placeholder="Enter email"
              autoComplete="off"
              {...registerField("email")}
            />
          </ValidatedField>

          <ValidatedField
            label="Phone"
            state={getFieldState("phone")}
            errorMessage={errors.phone?.message}
          >
            <Input
              placeholder="Enter phone"
              autoComplete="off"
              {...registerField("phone")}
            />
          </ValidatedField>

          <ValidatedField
            label="Gender"
            state={getFieldState("gender")}
            errorMessage={errors.gender?.message}
          >
            <AppSelect
              value={values.gender}
              onValueChange={(value) =>
                setValue("gender", value as StudentFormValues["gender"], {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={uniqueSelectOptions([...STUDENT_GENDER_OPTIONS])}
              triggerClassName={selectClass("gender")}
            />
          </ValidatedField>

          <ValidatedField
            label="Date of Birth"
            state={getFieldState("dateOfBirth")}
            errorMessage={errors.dateOfBirth?.message}
          >
            <Input type="date" autoComplete="off" {...registerField("dateOfBirth")} />
          </ValidatedField>

          <ValidatedField
            label="Qualification"
            state={getFieldState("qualification")}
            errorMessage={errors.qualification?.message}
          >
            <Input
              placeholder="Qualification"
              autoComplete="off"
              {...registerField("qualification")}
            />
          </ValidatedField>

          <ValidatedField
            label="College Name"
            state={getFieldState("collegeName")}
            errorMessage={errors.collegeName?.message}
          >
            <Input
              placeholder="College name"
              autoComplete="off"
              {...registerField("collegeName")}
            />
          </ValidatedField>

          <ValidatedField
            label="Specialization"
            state={getFieldState("specialization")}
            errorMessage={errors.specialization?.message}
          >
            <Input
              placeholder="Specialization"
              autoComplete="off"
              {...registerField("specialization")}
            />
          </ValidatedField>

          <ValidatedField
            label="Passing Year"
            state={getFieldState("passingYear")}
            errorMessage={errors.passingYear?.message}
          >
            <Input
              type="number"
              autoComplete="off"
              {...register("passingYear", { valueAsNumber: true })}
              className={inputClass("passingYear")}
            />
          </ValidatedField>

          <ValidatedField
            label="Address Line 1"
            state={getFieldState("addressLine1")}
            errorMessage={errors.addressLine1?.message}
          >
            <Input
              placeholder="Address line 1"
              autoComplete="off"
              {...registerField("addressLine1")}
            />
          </ValidatedField>

          <ValidatedField
            label="Address Line 2"
            state={getFieldState("addressLine2")}
            errorMessage={errors.addressLine2?.message}
          >
            <Input
              placeholder="Address line 2"
              autoComplete="off"
              {...registerField("addressLine2")}
            />
          </ValidatedField>

          <ValidatedField
            label="City"
            state={getFieldState("city")}
            errorMessage={errors.city?.message}
          >
            <Input placeholder="City" autoComplete="off" {...registerField("city")} />
          </ValidatedField>

          <ValidatedField
            label="State"
            state={getFieldState("state")}
            errorMessage={errors.state?.message}
          >
            <Input placeholder="State" autoComplete="off" {...registerField("state")} />
          </ValidatedField>

          <ValidatedField
            label="Country"
            state={getFieldState("country")}
            errorMessage={errors.country?.message}
          >
            <Input
              placeholder="Country"
              autoComplete="off"
              {...registerField("country")}
            />
          </ValidatedField>

          <ValidatedField
            label="Postal Code"
            state={getFieldState("postalCode")}
            errorMessage={errors.postalCode?.message}
          >
            <Input
              placeholder="Postal code"
              autoComplete="off"
              {...registerField("postalCode")}
            />
          </ValidatedField>

          <ValidatedField
            label="Parent Name"
            state={getFieldState("parentName")}
            errorMessage={errors.parentName?.message}
          >
            <Input
              placeholder="Parent name"
              autoComplete="off"
              {...registerField("parentName")}
            />
          </ValidatedField>

          <ValidatedField
            label="Parent Phone"
            state={getFieldState("parentPhone")}
            errorMessage={errors.parentPhone?.message}
          >
            <Input
              placeholder="Parent phone"
              autoComplete="off"
              {...registerField("parentPhone")}
            />
          </ValidatedField>

          <ValidatedField
            label="Emergency Contact Name"
            state={getFieldState("emergencyContactName")}
            errorMessage={errors.emergencyContactName?.message}
          >
            <Input
              placeholder="Emergency contact name"
              autoComplete="off"
              {...registerField("emergencyContactName")}
            />
          </ValidatedField>

          <ValidatedField
            label="Emergency Contact Phone"
            state={getFieldState("emergencyContactPhone")}
            errorMessage={errors.emergencyContactPhone?.message}
          >
            <Input
              placeholder="Emergency contact phone"
              autoComplete="off"
              {...registerField("emergencyContactPhone")}
            />
          </ValidatedField>

          <ValidatedField
            label="Admission Date"
            state={getFieldState("admissionDate")}
            errorMessage={errors.admissionDate?.message}
          >
            <Input
              type="date"
              autoComplete="off"
              {...registerField("admissionDate")}
            />
          </ValidatedField>

          <ValidatedField
            label="Status"
            state={getFieldState("status")}
            errorMessage={errors.status?.message}
          >
            <AppSelect
              value={values.status}
              onValueChange={(value) =>
                setValue("status", value as StudentFormValues["status"], {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
              options={uniqueSelectOptions([...STUDENT_STATUSES])}
              triggerClassName={selectClass("status")}
            />
          </ValidatedField>

          <div className="md:col-span-2">
            <ValidatedField
              label="Notes"
              state={getFieldState("notes")}
              errorMessage={errors.notes?.message}
            >
              <Textarea
                placeholder="Notes"
                rows={4}
                autoComplete="off"
                {...register("notes")}
                className={inputClass("notes")}
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

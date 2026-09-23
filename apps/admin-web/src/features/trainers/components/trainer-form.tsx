"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ReactNode,
} from "react";

import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Briefcase,
  Calendar,
  GraduationCap,
  Hash,
  Link2,
  Mail,
  Phone,
  Tag,
  User,
  type LucideIcon,
} from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { ImageUploadField } from "@/src/shared/components/ui/image-upload-field";
import { buildStudentQualificationSelectOptions } from "@mcj/shared-constants";
import {
  FieldVisualState,
  IconValidatedField,
  iconDecorInputClass,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";
import { appToast } from "@/src/shared/components/ui/toast";

import { TrainerBioField } from "@/src/features/trainers/components/trainer-bio-field";

import {
  createTrainerSchema,
  type CreateTrainerFormValues,
} from "@/src/features/trainers/schemas/trainer.schema";
import {
  TRAINER_GENDERS,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import { mapTrainerToFormValues } from "@/src/features/trainers/utils/map-trainer-to-form-values";
import {
  TRAINER_CHAR_LIMITS,
  validateTrainerImageFile,
} from "@/src/features/trainers/utils/trainer-form-validation";
import { withProfileImageCacheBust } from "@/src/features/trainers/utils/trainer-image.util";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

function iconInputClass(state: FieldVisualState, extra = "") {
  return iconDecorInputClass(state, cn("w-full min-w-0 max-w-full", extra));
}

type SyncFieldName = Exclude<
  keyof CreateTrainerFormValues,
  | "skills"
  | "employeeCode"
  | "gender"
  | "trainerType"
  | "profileImageFileId"
  | "experienceYears"
>;

type SyncNumberFieldName = "experienceYears";

type SelectFieldName = "gender" | "trainerType" | "qualification";

const OPTIONAL_EMPTY_NEUTRAL_FIELDS = new Set<SyncFieldName>([
  "lastName",
  "bio",
  "joinedAt",
  "qualification",
  "specialization",
  "linkedInUrl",
  "youtubeUrl",
  "instagramUrl",
]);

const EMPTY_DEFAULT_VALUES: CreateTrainerFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "MALE",
  bio: "",
  qualification: "",
  specialization: "",
  skills: [],
  employeeCode: "",
  trainerType: "FULL_TIME",
  experienceYears: 0,
  joinedAt: "",
  linkedInUrl: "",
  youtubeUrl: "",
  instagramUrl: "",
};

interface TrainerFormProps {
  mode: "create" | "edit";
  trainer?: TrainerDetails;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (
    values: CreateTrainerFormValues,
    image: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
}

export function TrainerForm({
  mode,
  trainer,
  isSubmitting,
  submitLabel,
  onSubmit,
}: TrainerFormProps) {
  const isEdit = mode === "edit";

  const [skillInput, setSkillInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const selectedImageRef = useRef<File | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const removeImageRef = useRef(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageTouched, setImageTouched] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    isEdit && trainer?.profileImageUrl
      ? withProfileImageCacheBust(
          trainer.profileImageUrl,
          trainer.updatedAt,
        )
      : null,
  );
  const [suggestedCode, setSuggestedCode] = useState(
    isEdit ? trainer?.employeeCode ?? "" : ""
  );
  const [isSuggestingCode, setIsSuggestingCode] =
    useState(false);
  const [editValidationReady, setEditValidationReady] =
    useState(isEdit);
  const loadedTrainerKeyRef = useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    reset,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<CreateTrainerFormValues>({
    resolver: zodResolver(createTrainerSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: EMPTY_DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!isEdit || !trainer) {
      loadedTrainerKeyRef.current = null;
      return;
    }

    const key = `${trainer.id}:${trainer.updatedAt}`;
    if (loadedTrainerKeyRef.current === key) {
      return;
    }

    loadedTrainerKeyRef.current = key;
    reset(mapTrainerToFormValues(trainer));
  }, [isEdit, trainer, reset]);

  const currentSkills = watch("skills") || [];
  const values = watch();
  const trainerCode =
    isEdit ? watch("employeeCode") || trainer?.employeeCode || "" : suggestedCode;

  useEffect(() => {
    if (!isEdit || !trainer) {
      setEditValidationReady(false);
      return;
    }

    setEditValidationReady(false);
    setSuggestedCode(trainer.employeeCode ?? "");
    setPreviewUrl(
      trainer.profileImageUrl
        ? withProfileImageCacheBust(
            trainer.profileImageUrl,
            trainer.updatedAt,
          )
        : null,
    );
    setSelectedImage(null);
    selectedImageRef.current = null;
    setRemoveImage(false);
    removeImageRef.current = false;
    setImageError(null);
    setImageTouched(false);
    setEditValidationReady(true);
  }, [
    isEdit,
    trainer?.id,
    trainer?.updatedAt,
    trainer?.profileImageUrl,
  ]);

  useEffect(() => {
    if (isEdit) {
      return;
    }

    let cancelled = false;

    const loadSuggestedCode = async () => {
      try {
        setIsSuggestingCode(true);
        const response =
          await trainerService.suggestTrainerCode();

        if (cancelled) {
          return;
        }

        const code = response.data.employeeCode;
        setSuggestedCode(code);
        setValue("employeeCode", code, {
          shouldDirty: false,
          shouldValidate: false,
        });
      } catch {
        // Suggestion is UX-only.
      } finally {
        if (!cancelled) {
          setIsSuggestingCode(false);
        }
      }
    };

    void loadSuggestedCode();

    return () => {
      cancelled = true;
    };
  }, [isEdit, setValue]);

  useEffect(() => {
    if (!selectedImage) {
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  const getImageState = (): FieldVisualState => {
    if (!imageTouched && !(isEdit && editValidationReady)) {
      return "neutral";
    }
    if (imageError) {
      return "invalid";
    }
    if (selectedImage || (previewUrl && !removeImage)) {
      return "valid";
    }
    return "neutral";
  };

  const handleImageSelect = (file: File | null) => {
    setImageTouched(true);
    setRemoveImage(false);
    removeImageRef.current = false;
    if (!file) {
      setSelectedImage(null);
      selectedImageRef.current = null;
      setImageError(null);
      return;
    }

    const validationMessage = validateTrainerImageFile(file);
    if (validationMessage) {
      setSelectedImage(null);
      selectedImageRef.current = null;
      setImageError(validationMessage);
      return;
    }

    setImageError(null);
    selectedImageRef.current = file;
    setSelectedImage(file);
  };

  const renderIconInput = (
    label: string,
    field: {
      state: FieldVisualState;
      errorMessage?: string;
      inputProps: React.ComponentProps<typeof Input>;
    },
    icon: LucideIcon,
    placeholder: string,
    options?: {
      required?: boolean;
      footer?: ReactNode;
      type?: string;
    },
  ) => (
    <IconValidatedField
      label={label}
      required={options?.required}
      state={field.state}
      errorMessage={field.errorMessage}
      icon={icon}
    >
      <Input
        {...field.inputProps}
        type={options?.type}
        placeholder={placeholder}
        className={iconInputClass(field.state)}
      />
      {options?.footer}
    </IconValidatedField>
  );

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    const trimmedValue = skillInput.trim();

    if (
      trimmedValue &&
      !currentSkills.includes(trimmedValue)
    ) {
      setValue("skills", [...currentSkills, trimmedValue]);
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setValue(
      "skills",
      currentSkills.filter((skill) => skill !== skillToRemove)
    );
  };

  const shouldShowFieldValidation = (
    name: keyof CreateTrainerFormValues
  ) => {
    const interacted =
      Boolean(touchedFields[name]) ||
      Boolean(dirtyFields[name]) ||
      isSubmitted;

    return interacted || (isEdit && editValidationReady);
  };

  const isOptionalEmptyValue = (
    name: SyncFieldName,
    raw: unknown
  ) => {
    if (!OPTIONAL_EMPTY_NEUTRAL_FIELDS.has(name)) {
      return false;
    }

    if (raw === undefined || raw === null) {
      return true;
    }

    return typeof raw === "string" && raw.trim() === "";
  };

  const getSyncFieldState = (
    name: SyncFieldName
  ): FieldVisualState => {
    if (!shouldShowFieldValidation(name)) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    const raw = values[name];

    if (isOptionalEmptyValue(name, raw)) {
      return "neutral";
    }

    if (raw === undefined || raw === null) {
      return "invalid";
    }

    if (typeof raw === "string" && raw.trim() === "") {
      return "invalid";
    }

    if (typeof raw === "number" && Number.isNaN(raw)) {
      return "invalid";
    }

    return "valid";
  };

  const getSyncNumberFieldState = (
    name: SyncNumberFieldName
  ): FieldVisualState => {
    if (!shouldShowFieldValidation(name)) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    const raw = values[name];

    if (
      raw === undefined ||
      raw === null ||
      (typeof raw === "number" && Number.isNaN(raw))
    ) {
      return "neutral";
    }

    return "valid";
  };

  const getSelectFieldState = (
    name: SelectFieldName
  ): FieldVisualState => {
    if (!shouldShowFieldValidation(name)) {
      return "neutral";
    }

    if (errors[name]) {
      return "invalid";
    }

    if (name === "qualification") {
      const raw = values.qualification?.trim() ?? "";
      if (!raw) {
        return "neutral";
      }
      return "valid";
    }

    return values[name] ? "valid" : "invalid";
  };

  const syncField = (name: SyncFieldName) => {
    const registration = register(name);
    const state = getSyncFieldState(name);

    return {
      state,
      errorMessage: errors[name]?.message,
      inputProps: {
        ...registration,
        className: iconInputClass(state),
        onBlur: (event: FocusEvent<HTMLInputElement>) => {
          registration.onBlur(event);
          void trigger(name);
        },
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          registration.onChange(event);
          void trigger(name);
        },
      },
    };
  };

  const syncNumberField = (name: SyncNumberFieldName) => {
    const registration = register(name, {
      valueAsNumber: true,
    });
    const state = getSyncNumberFieldState(name);

    return {
      state,
      errorMessage: errors[name]?.message,
      inputProps: {
        ...registration,
        className: iconInputClass(state),
        onBlur: (event: FocusEvent<HTMLInputElement>) => {
          registration.onBlur(event);
          void trigger(name);
        },
        onChange: (event: ChangeEvent<HTMLInputElement>) => {
          registration.onChange(event);
          void trigger(name);
        },
      },
    };
  };

  const bioRegistration = register("bio");
  const bioFieldState = getSyncFieldState("bio");
  const experienceYearsField =
    syncNumberField("experienceYears");
  const joiningDateField = syncField("joinedAt");
  const firstNameField = syncField("firstName");
  const lastNameField = syncField("lastName");
  const emailField = syncField("email");
  const phoneField = syncField("phone");
  const specializationField = syncField("specialization");
  const linkedInField = syncField("linkedInUrl");
  const youtubeField = syncField("youtubeUrl");
  const instagramField = syncField("instagramUrl");
  const genderFieldState = getSelectFieldState("gender");
  const trainerTypeFieldState =
    getSelectFieldState("trainerType");
  const qualificationFieldState =
    getSelectFieldState("qualification");
  const qualificationOptions = buildStudentQualificationSelectOptions(
    values.qualification,
  );

  const resolveFirstValidationMessage = (
    fieldErrors: FieldErrors<CreateTrainerFormValues>,
  ): string => {
    for (const fieldError of Object.values(fieldErrors)) {
      if (
        fieldError &&
        typeof fieldError === "object" &&
        "message" in fieldError &&
        typeof fieldError.message === "string" &&
        fieldError.message.trim()
      ) {
        return fieldError.message;
      }
    }

    return "Please fix the highlighted fields before saving.";
  };

  return (
    <form
      className="space-y-5 bg-white"
      onSubmit={handleSubmit(
        async (formValues) => {
          await onSubmit(
            formValues,
            selectedImageRef.current,
            removeImageRef.current,
          );
        },
        (fieldErrors) => {
          appToast.error(resolveFirstValidationMessage(fieldErrors));
          void trigger();
        },
      )}
    >
      {isEdit ? (
        <>
          <input type="hidden" {...register("employeeCode")} />
          <input type="hidden" {...register("gender")} />
          <input type="hidden" {...register("trainerType")} />
          <input type="hidden" {...register("qualification")} />
        </>
      ) : null}
      <ValidatedField
        label="Profile Image"
        state={getImageState()}
        errorMessage={imageError ?? undefined}
      >
        <ImageUploadField
          entityLabel="trainer profile"
          previewAlt="Trainer profile preview"
          previewUrl={removeImage ? null : previewUrl}
          file={selectedImage}
          disabled={isSubmitting}
          error={imageError}
          state={getImageState()}
          validateFile={validateTrainerImageFile}
          onFileSelect={handleImageSelect}
          onRemove={() => {
            setImageTouched(true);
            setSelectedImage(null);
            selectedImageRef.current = null;
            setRemoveImage(true);
            removeImageRef.current = true;
            setPreviewUrl(null);
            setImageError(null);
          }}
        />
      </ValidatedField>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {renderIconInput(
          "Trainer Name",
          firstNameField,
          User,
          "Enter trainer name",
          {
            required: true,
            footer: (
              <p
                className={cn(
                  "mt-1 text-right text-xs tabular-nums",
                  (values.firstName?.length ?? 0) >
                    TRAINER_CHAR_LIMITS.firstName
                    ? "text-red-600"
                    : "text-slate-500",
                )}
              >
                {Math.min(
                  values.firstName?.length ?? 0,
                  TRAINER_CHAR_LIMITS.firstName,
                )}
                /{TRAINER_CHAR_LIMITS.firstName} characters
              </p>
            ),
          },
        )}

        {renderIconInput(
          "Last Name",
          lastNameField,
          User,
          "Enter last name",
        )}

        <IconValidatedField
          label="Trainer Code"
          icon={Hash}
          state={
            isEdit
              ? "neutral"
              : isSuggestingCode
                ? "checking"
                : "valid"
          }
          successMessage={
            !isEdit && suggestedCode ? "Auto-generated" : undefined
          }
        >
          <Input
            value={trainerCode}
            readOnly
            placeholder={
              isSuggestingCode ? "Generating code..." : "Trainer code"
            }
            className={iconInputClass(isEdit ? "neutral" : "valid")}
          />
        </IconValidatedField>

        {renderIconInput(
          "Email",
          emailField,
          Mail,
          "example@domain.com",
          { type: "email", required: true },
        )}

        {renderIconInput(
          "Phone",
          phoneField,
          Phone,
          "Enter phone number",
          { required: true },
        )}

        <IconValidatedField
          label="Gender"
          icon={User}
          select
          state={genderFieldState}
          errorMessage={errors.gender?.message}
        >
          <AppSelect
            value={watch("gender") ?? ""}
            placeholder="Select gender"
            options={TRAINER_GENDERS.map((gender) => ({
              label: gender,
              value: gender,
            }))}
            triggerClassName={validatedFieldInputClass(
              genderFieldState,
              "w-full min-w-0 max-w-full",
              { leftIcon: true, select: true },
            )}
            onValueChange={(value) => {
              setValue("gender", value as never, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </IconValidatedField>

        <IconValidatedField
          label="Trainer Type"
          icon={Briefcase}
          select
          state={trainerTypeFieldState}
          errorMessage={errors.trainerType?.message}
        >
          <AppSelect
            value={watch("trainerType") ?? ""}
            placeholder="Select trainer type"
            options={TRAINER_TYPES.map((type) => ({
              label: type.replaceAll("_", " "),
              value: type,
            }))}
            triggerClassName={validatedFieldInputClass(
              trainerTypeFieldState,
              "w-full min-w-0 max-w-full",
              { leftIcon: true, select: true },
            )}
            onValueChange={(value) => {
              setValue("trainerType", value as never, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </IconValidatedField>
      </div>

      <div className="min-w-0">
        <IconValidatedField
          label="Skills (Press Enter to add)"
          icon={Tag}
          state="neutral"
        >
          <Input
            placeholder="Type a skill and press Enter"
            className={iconInputClass("neutral")}
            value={skillInput}
            onChange={(event) => setSkillInput(event.target.value)}
            onKeyDown={handleKeyDown}
          />
        </IconValidatedField>
        {currentSkills.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {currentSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-md border bg-slate-50 px-2.5 py-1 text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-xs font-bold text-slate-500 hover:text-red-600"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <TrainerBioField
        value={watch("bio") ?? ""}
        state={bioFieldState}
        errorMessage={errors.bio?.message}
        onChange={(nextValue) => {
          setValue("bio", nextValue, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }}
        onBlur={(event) => {
          bioRegistration.onBlur(event);
          void trigger("bio");
        }}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <IconValidatedField
          label="Qualification"
          icon={GraduationCap}
          select
          state={qualificationFieldState}
          errorMessage={errors.qualification?.message}
        >
          <AppSelect
            value={values.qualification ?? ""}
            placeholder="Select qualification"
            options={qualificationOptions}
            triggerClassName={validatedFieldInputClass(
              qualificationFieldState,
              "w-full min-w-0 max-w-full",
              { leftIcon: true, select: true },
            )}
            onValueChange={(value) => {
              setValue("qualification", value, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </IconValidatedField>

        {renderIconInput(
          "Specialization",
          specializationField,
          Briefcase,
          "e.g. Strength Training",
        )}

        <IconValidatedField
          label="Experience (Years)"
          icon={Hash}
          state={experienceYearsField.state}
          errorMessage={experienceYearsField.errorMessage}
        >
          <Input
            type="number"
            min={0}
            {...experienceYearsField.inputProps}
            placeholder="0"
            className={iconInputClass(experienceYearsField.state)}
          />
        </IconValidatedField>

        <IconValidatedField
          label="Joining Date"
          icon={Calendar}
          state={joiningDateField.state}
          errorMessage={joiningDateField.errorMessage}
        >
          <Input
            type="date"
            placeholder="Select joining date"
            {...joiningDateField.inputProps}
            className={iconInputClass(joiningDateField.state)}
          />
        </IconValidatedField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderIconInput(
          "LinkedIn",
          linkedInField,
          Link2,
          "https://...",
        )}

        {renderIconInput(
          "YouTube",
          youtubeField,
          Link2,
          "https://...",
        )}

        {renderIconInput(
          "Instagram",
          instagramField,
          Link2,
          "https://...",
        )}
      </div>

      <Button
        type="submit"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {submitLabel}
      </Button>
    </form>
  );
}

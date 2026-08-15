"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FocusEvent,
} from "react";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Input } from "@/src/shared/components/ui/input";
import { Button } from "@/src/shared/components/ui/button";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Switch } from "@/src/shared/components/ui/switch";
import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";

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
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

type SyncFieldName = Exclude<
  keyof CreateTrainerFormValues,
  | "skills"
  | "employeeCode"
  | "gender"
  | "trainerType"
  | "isFeatured"
  | "profileImageFileId"
  | "experienceYears"
>;

type SyncNumberFieldName = "experienceYears";

type SelectFieldName = "gender" | "trainerType";

const OPTIONAL_EMPTY_NEUTRAL_FIELDS = new Set<SyncFieldName>([
  "lastName",
  "bio",
  "joinedAt",
  "qualification",
  "specialization",
  "linkedInUrl",
  "youtubeUrl",
  "instagramUrl",
  "email",
  "phone",
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
  isFeatured: false,
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
    image: File | null
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

  const initialValues = useMemo(
    () =>
      isEdit && trainer
        ? mapTrainerToFormValues(trainer)
        : EMPTY_DEFAULT_VALUES,
    [isEdit, trainer]
  );

  const [skillInput, setSkillInput] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<
    string | null
  >(isEdit ? trainer?.profileImageUrl ?? null : null);
  const [suggestedCode, setSuggestedCode] = useState(
    isEdit ? trainer?.employeeCode ?? "" : ""
  );
  const [isSuggestingCode, setIsSuggestingCode] =
    useState(false);
  const [editValidationReady, setEditValidationReady] =
    useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
    formState: { errors, touchedFields, dirtyFields, isSubmitted },
  } = useForm<CreateTrainerFormValues>({
    resolver: zodResolver(createTrainerSchema) as any,
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: initialValues,
  });

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
    reset(mapTrainerToFormValues(trainer));
    setSuggestedCode(trainer.employeeCode ?? "");
    setPreviewUrl(trainer.profileImageUrl);
    setSelectedImage(null);

    void trigger().then(() => {
      setEditValidationReady(true);
    });
  }, [
    isEdit,
    trainer?.id,
    trainer?.updatedAt,
    trainer,
    reset,
    trigger,
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
        className: validatedFieldInputClass(state),
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
        className: validatedFieldInputClass(state),
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
  const qualificationField = syncField("qualification");
  const specializationField = syncField("specialization");
  const linkedInField = syncField("linkedInUrl");
  const youtubeField = syncField("youtubeUrl");
  const instagramField = syncField("instagramUrl");
  const genderFieldState = getSelectFieldState("gender");
  const trainerTypeFieldState =
    getSelectFieldState("trainerType");

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(async (formValues) => {
        await onSubmit(formValues, selectedImage);
      })}
    >
      <div className="flex flex-col gap-2">
        <Label>Profile Image</Label>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="Trainer preview"
            className="h-32 w-32 rounded-md border object-contain"
          />
        ) : null}
        <Input
          type="file"
          accept="image/*"
          onChange={(event) => {
            setSelectedImage(event.target.files?.[0] ?? null);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ValidatedField
          label="First Name"
          required
          state={firstNameField.state}
          errorMessage={firstNameField.errorMessage}
        >
          <Input
            {...firstNameField.inputProps}
            placeholder="Enter first name"
          />
        </ValidatedField>

        <ValidatedField
          label="Last Name"
          state={lastNameField.state}
          errorMessage={lastNameField.errorMessage}
        >
          <Input
            {...lastNameField.inputProps}
            placeholder="Enter last name"
          />
        </ValidatedField>

        <ValidatedField
          label="Trainer Code"
          state={
            isEdit
              ? "neutral"
              : isSuggestingCode
                ? "checking"
                : "valid"
          }
          successMessage={
            !isEdit && suggestedCode
              ? "Auto-generated"
              : undefined
          }
        >
          <Input
            value={trainerCode}
            readOnly
            placeholder={
              isSuggestingCode
                ? "Generating code..."
                : "Trainer code"
            }
            className={validatedFieldInputClass(
              isEdit ? "neutral" : "valid"
            )}
          />
        </ValidatedField>

        <ValidatedField
          label="Email"
          state={emailField.state}
          errorMessage={emailField.errorMessage}
        >
          <Input
            type="email"
            {...emailField.inputProps}
            placeholder="example@domain.com"
          />
        </ValidatedField>

        <ValidatedField
          label="Phone"
          state={phoneField.state}
          errorMessage={phoneField.errorMessage}
        >
          <Input
            {...phoneField.inputProps}
            placeholder="Enter phone number"
          />
        </ValidatedField>

        <ValidatedField
          label="Gender"
          state={genderFieldState}
          errorMessage={errors.gender?.message}
        >
          <AppSelect
            value={watch("gender")}
            options={TRAINER_GENDERS.map((gender) => ({
              label: gender,
              value: gender,
            }))}
            triggerClassName={validatedFieldInputClass(
              genderFieldState,
              "pr-10"
            )}
            onValueChange={(value) => {
              setValue("gender", value as never, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </ValidatedField>

        <ValidatedField
          label="Trainer Type"
          state={trainerTypeFieldState}
          errorMessage={errors.trainerType?.message}
        >
          <AppSelect
            value={watch("trainerType")}
            options={TRAINER_TYPES.map((type) => ({
              label: type.replaceAll("_", " "),
              value: type,
            }))}
            triggerClassName={validatedFieldInputClass(
              trainerTypeFieldState,
              "pr-10"
            )}
            onValueChange={(value) => {
              setValue("trainerType", value as never, {
                shouldDirty: true,
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </ValidatedField>
      </div>

      <div className="min-w-0">
        <Label>
          Skills{" "}
          <span className="text-xs text-slate-400">
            (Press Enter to add)
          </span>
        </Label>
        <Input
          placeholder="Type a skill and press Enter"
          value={skillInput}
          onChange={(event) =>
            setSkillInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
        />
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
        <ValidatedField
          label="Qualification"
          state={qualificationField.state}
          errorMessage={qualificationField.errorMessage}
        >
          <Input
            {...qualificationField.inputProps}
            placeholder="Degree / Certification"
          />
        </ValidatedField>

        <ValidatedField
          label="Specialization"
          state={specializationField.state}
          errorMessage={specializationField.errorMessage}
        >
          <Input
            {...specializationField.inputProps}
            placeholder="e.g. Strength Training"
          />
        </ValidatedField>

        <ValidatedField
          label="Experience (Years)"
          state={experienceYearsField.state}
          errorMessage={experienceYearsField.errorMessage}
        >
          <Input
            type="number"
            min={0}
            {...experienceYearsField.inputProps}
            placeholder="0"
          />
        </ValidatedField>

        <ValidatedField
          label="Joining Date"
          state={joiningDateField.state}
          errorMessage={joiningDateField.errorMessage}
        >
          <Input
            type="date"
            {...joiningDateField.inputProps}
          />
        </ValidatedField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ValidatedField
          label="LinkedIn"
          state={linkedInField.state}
          errorMessage={linkedInField.errorMessage}
        >
          <Input
            {...linkedInField.inputProps}
            placeholder="https://..."
          />
        </ValidatedField>

        <ValidatedField
          label="YouTube"
          state={youtubeField.state}
          errorMessage={youtubeField.errorMessage}
        >
          <Input
            {...youtubeField.inputProps}
            placeholder="https://..."
          />
        </ValidatedField>

        <ValidatedField
          label="Instagram"
          state={instagramField.state}
          errorMessage={instagramField.errorMessage}
        >
          <Input
            {...instagramField.inputProps}
            placeholder="https://..."
          />
        </ValidatedField>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={watch("isFeatured")}
          onCheckedChange={(value) =>
            setValue("isFeatured", value)
          }
        />
        <Label>Featured Trainer</Label>
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

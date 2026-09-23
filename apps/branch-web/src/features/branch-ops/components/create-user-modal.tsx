"use client";

import { useEffect, useMemo, useState } from "react";
import { type FieldErrors, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, Phone, Shield, UserRound } from "lucide-react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { PasswordInput } from "@/src/shared/components/ui/password-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import {
  FieldVisualState,
  ValidatedField,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  isDeletedAccountRestorable,
  isEmailConflict,
  isPhoneConflict,
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import type {
  BranchTrainerUserOption,
  BranchUserItem,
} from "@/src/features/branch-ops/types";
import { appToast } from "@/src/shared/lib/toast";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
const phoneRegex = /^[6-9]\d{9}$/;

const STAFF_FIELD_ORDER = [
  "trainerId",
  "role",
  "email",
  "password",
  "phone",
] as const;

const createSchema = z
  .object({
    mode: z.literal("create"),
    trainerId: z.string().min(1, "Select an assigned trainer"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .toLowerCase()
      .email("Please enter a valid email address"),
    phone: z.string().trim(),
    password: z
      .string()
      .min(1, "Password is required")
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number and special character",
      ),
    role: z.enum(["FACULTY", "INTERVIEWER"], {
      error: "Select role",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.phone && !phoneRegex.test(values.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid 10-digit mobile number",
      });
    }
  });

const editSchema = z
  .object({
    mode: z.literal("edit"),
    trainerId: z.string().min(1, "Select an assigned trainer"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .toLowerCase()
      .email("Please enter a valid email address"),
    phone: z.string().trim(),
    password: z.string(),
    role: z.enum(["FACULTY", "INTERVIEWER"], {
      error: "Select role",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.phone && !phoneRegex.test(values.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["phone"],
        message: "Enter a valid 10-digit mobile number",
      });
    }
    if (values.password && !passwordRegex.test(values.password)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["password"],
        message:
          "Password must contain uppercase, lowercase, number and special character",
      });
    }
  });

const schema = z.discriminatedUnion("mode", [createSchema, editSchema]);

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  user?: BranchUserItem | null;
  onClose: () => void;
  onSuccess: () => void;
  onEditExistingUser?: (userId: string) => void;
}

function fieldState(
  touched: boolean,
  submitted: boolean,
  error?: string,
  value?: string,
): FieldVisualState {
  if (!(touched || submitted)) return "neutral";
  if (error) return "invalid";
  if (value) return "valid";
  return "neutral";
}

function trainerLabel(trainer: BranchTrainerUserOption): string {
  const name = [trainer.firstName, trainer.lastName].filter(Boolean).join(" ");
  const code = trainer.employeeCode ? ` · ${trainer.employeeCode}` : "";
  return `${name}${code}`;
}

function resolveLinkedTrainerId(
  branchUser: BranchUserItem,
  options: BranchTrainerUserOption[],
): string {
  const linked = options.find(
    (trainer) => trainer.linkedBranchUserId === branchUser.id,
  );
  if (linked) return linked.trainerId;

  const normalizedEmail = branchUser.email?.trim().toLowerCase();
  const phone = branchUser.phone?.trim();

  for (const trainer of options) {
    if (
      normalizedEmail &&
      trainer.email?.trim().toLowerCase() === normalizedEmail
    ) {
      return trainer.trainerId;
    }
    if (phone && trainer.phone?.trim() === phone) {
      return trainer.trainerId;
    }
  }

  return "";
}

function focusFirstInvalid(errors: FieldErrors<FormValues>) {
  const first = STAFF_FIELD_ORDER.find(
    (name) => errors[name as keyof FormValues],
  );
  if (!first) return;

  const container = document.getElementById(`branch-staff-${first}`);
  container?.scrollIntoView({ block: "center", behavior: "smooth" });

  const focusable = container?.querySelector<HTMLElement>(
    "input, button, [tabindex]:not([tabindex='-1'])",
  );
  focusable?.focus();
}

export function CreateBranchStaffModal({
  open,
  user,
  onClose,
  onSuccess,
  onEditExistingUser,
}: Props) {
  const isEdit = Boolean(user);
  const [restoreValues, setRestoreValues] = useState<FormValues | null>(null);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [trainerOptions, setTrainerOptions] = useState<
    BranchTrainerUserOption[]
  >([]);
  const [trainersLoading, setTrainersLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: {
      mode: "create",
      trainerId: "",
      email: "",
      phone: "",
      password: "",
      role: "FACULTY",
    } as unknown as FormValues,
  });

  useEffect(() => {
    if (!open) return;

    if (!user) {
      form.reset({
        mode: "create",
        trainerId: "",
        email: "",
        phone: "",
        password: "",
        role: "FACULTY",
      } as FormValues);
    }
  }, [open, user, form]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setTrainersLoading(true);
    void branchOpsApi
      .userTrainerOptions()
      .then((items) => {
        if (!cancelled) setTrainerOptions(items);
      })
      .catch((error) => {
        if (!cancelled) {
          appToast.error(userFacingApiMessage(parseBranchOpsError(error)));
          setTrainerOptions([]);
        }
      })
      .finally(() => {
        if (!cancelled) setTrainersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !user || trainersLoading) return;

    form.reset({
      mode: "edit",
      trainerId: resolveLinkedTrainerId(user, trainerOptions),
      email: user.email ?? "",
      phone: user.phone ?? "",
      password: "",
      role:
        user.role === "INTERVIEWER" || user.role === "FACULTY"
          ? user.role
          : "FACULTY",
    });
  }, [open, user, trainersLoading, trainerOptions, form]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    setFocus,
    trigger,
    getValues,
    formState: { errors, touchedFields, isSubmitted, isSubmitting },
  } = form;

  useEffect(() => {
    if (!open || trainersLoading) return;

    const mode = getValues("mode");
    if (mode !== "create" && mode !== "edit") return;

    const currentTrainerId = getValues("trainerId");

    if (
      currentTrainerId &&
      !trainerOptions.some((trainer) => trainer.trainerId === currentTrainerId)
    ) {
      setValue("trainerId", "", {
        shouldValidate: false,
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [open, trainersLoading, trainerOptions, getValues, setValue]);

  const selectedTrainerId = watch("trainerId") ?? "";

  const selectedTrainer = useMemo(
    () =>
      trainerOptions.find((trainer) => trainer.trainerId === selectedTrainerId),
    [trainerOptions, selectedTrainerId],
  );

  const trainerNeedsPhone =
    selectedTrainer != null && !selectedTrainer.phone?.trim();

  useEffect(() => {
    if (!open || isEdit || !selectedTrainer) return;

    if (selectedTrainer.email?.trim()) {
      setValue("email", selectedTrainer.email.trim().toLowerCase(), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }

    if (selectedTrainer.phone?.trim()) {
      setValue("phone", selectedTrainer.phone.trim(), {
        shouldValidate: true,
        shouldDirty: true,
      });
    } else {
      setValue("phone", "", { shouldValidate: false, shouldDirty: false });
    }
  }, [open, isEdit, selectedTrainer, setValue]);

  const submitCreate = async (
    values: Extract<FormValues, { mode: "create" }>,
    confirmRestore = false,
  ) => {
    setRestoreLoading(true);
    try {
      const created = await branchOpsApi.createUser({
        trainerId: values.trainerId,
        email: values.email,
        phone: values.phone?.trim() || undefined,
        password: values.password,
        role: values.role,
        confirmRestore,
      });
      appToast.success(
        created.restored
          ? "Existing deleted user restored and updated successfully."
          : "User created successfully.",
      );
      setRestoreValues(null);
      onSuccess();
      onClose();
    } catch (error) {
      if (!confirmRestore) throw error;
      const apiError = parseBranchOpsError(error);
      appToast.error(userFacingApiMessage(apiError));
    } finally {
      setRestoreLoading(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    try {
      if (values.mode === "edit" && user) {
        if (trainerNeedsPhone && !values.phone.trim()) {
          setError("phone", {
            type: "manual",
            message: "Phone is required for this trainer",
          });
          setFocus("phone");
          return;
        }

        const otherAccount =
          selectedTrainer?.hasAccount &&
          selectedTrainer.linkedBranchUserId !== user.id;

        if (otherAccount) {
          appToast.error("This trainer already has a user account.");
          if (selectedTrainer.linkedBranchUserId) {
            onEditExistingUser?.(selectedTrainer.linkedBranchUserId);
          }
          return;
        }

        await branchOpsApi.updateUser(user.id, {
          trainerId: values.trainerId,
          email: values.email,
          phone: values.phone?.trim() || undefined,
          role: values.role,
        });

        if (values.password.trim()) {
          await branchOpsApi.resetPassword(user.id, values.password);
        }

        appToast.success("User updated");
        onSuccess();
        onClose();
        return;
      }

      if (values.mode !== "create") return;

      if (selectedTrainer?.hasAccount && selectedTrainer.linkedBranchUserId) {
        appToast.error("This trainer already has a user account.");
        onEditExistingUser?.(selectedTrainer.linkedBranchUserId);
        return;
      }

      if (trainerNeedsPhone && !values.phone.trim()) {
        setError("phone", {
          type: "manual",
          message: "Phone is required for this trainer",
        });
        setFocus("phone");
        return;
      }

      await submitCreate(values, false);
    } catch (error) {
      const apiError = parseBranchOpsError(error);

      if (
        values.mode === "create" &&
        isDeletedAccountRestorable(apiError)
      ) {
        setRestoreValues(values);
        return;
      }

      if (isEmailConflict(apiError)) {
        setError(
          "email",
          {
            type: "server",
            message:
              apiError.message ||
              "An active user already exists with this email.",
          },
          { shouldFocus: true },
        );
        return;
      }

      if (isPhoneConflict(apiError)) {
        setError(
          "phone",
          {
            type: "server",
            message:
              apiError.message ||
              "An active user already exists with this phone number.",
          },
          { shouldFocus: true },
        );
        return;
      }

      if (isEmailConflict(apiError) && values.mode === "edit") {
        setError(
          "email",
          {
            type: "server",
            message:
              apiError.message ||
              "An active user already exists with this email.",
          },
          { shouldFocus: true },
        );
        return;
      }

      if (isPhoneConflict(apiError) && values.mode === "edit") {
        setError(
          "phone",
          {
            type: "server",
            message:
              apiError.message ||
              "An active user already exists with this phone number.",
          },
          { shouldFocus: true },
        );
        return;
      }

      if (
        apiError.status === 409 &&
        (values.mode === "create" || values.mode === "edit")
      ) {
        const linkedId =
          typeof apiError.meta?.linkedBranchUserId === "string"
            ? apiError.meta.linkedBranchUserId
            : null;
        if (linkedId) {
          appToast.error(
            apiError.message ??
              "This trainer already has a branch user account.",
          );
          onEditExistingUser?.(linkedId);
          return;
        }
      }

      appToast.error(userFacingApiMessage(apiError));
    }
  };

  const fieldMessage = (name: string) =>
    (errors as Record<string, { message?: string } | undefined>)[name]
      ?.message;

  const visual = (name: string): FieldVisualState =>
    fieldState(
      Boolean(
        (touchedFields as Record<string, boolean | undefined>)[name],
      ),
      isSubmitted,
      fieldMessage(name),
      String(watch(name as keyof FormValues) ?? ""),
    );

  const hasAssignedTrainers =
    !trainersLoading && trainerOptions.length > 0;

  const trainerSelectOptions = trainerOptions.map((trainer) => {
    const isCurrentUserTrainer =
      isEdit && trainer.linkedBranchUserId === user?.id;
    const takenByOther =
      trainer.hasAccount && !isCurrentUserTrainer;

    return {
      value: trainer.trainerId,
      label: takenByOther
        ? `${trainerLabel(trainer)} (account exists)`
        : trainerLabel(trainer),
      disabled: takenByOther,
    };
  });

  const trainerFieldBlock = (
    <>
      <ValidatedField
        htmlId="branch-staff-trainerId"
        label="Assigned trainer"
        required
        select={hasAssignedTrainers}
        leftIcon={<UserRound className="h-4 w-4" />}
        state={hasAssignedTrainers ? visual("trainerId") : "neutral"}
        errorMessage={
          hasAssignedTrainers ? fieldMessage("trainerId") : undefined
        }
      >
        {trainersLoading ? (
          <div
            className={validatedFieldInputClass("neutral", undefined, {
              leftIcon: true,
            })}
          >
            <span className="text-sm text-[#647A9B]">Loading trainers...</span>
          </div>
        ) : hasAssignedTrainers ? (
          <AppSelect
            value={selectedTrainerId || undefined}
            placeholder="Select assigned trainer"
            disabled={trainersLoading}
            triggerClassName={validatedFieldInputClass(
              visual("trainerId"),
              undefined,
              { leftIcon: true, select: true },
            )}
            onValueChange={(value) => {
              setValue("trainerId", value, {
                shouldValidate: true,
                shouldTouch: true,
                shouldDirty: true,
              });
              void trigger("trainerId");
            }}
            options={trainerSelectOptions}
          />
        ) : (
          <div
            className={validatedFieldInputClass("neutral", undefined, {
              leftIcon: true,
            })}
          >
            <div className="min-w-0 py-0.5">
              <p className="text-sm font-medium text-[#102A56]">
                No trainer assigned yet
              </p>
              <p className="mt-0.5 text-xs leading-snug text-[#647A9B]">
                Assign an active trainer to this branch first, then return here
                to {isEdit ? "update this" : "create their"} user account.
              </p>
            </div>
          </div>
        )}
      </ValidatedField>

      <ValidatedField
        htmlId="branch-staff-role"
        label="Role"
        required
        select
        leftIcon={<Shield className="h-4 w-4" />}
        state={visual("role")}
        errorMessage={fieldMessage("role")}
      >
        <AppSelect
          value={watch("role") || undefined}
          placeholder="Select role"
          triggerClassName={validatedFieldInputClass(visual("role"), undefined, {
            leftIcon: true,
            select: true,
          })}
          onValueChange={(value) => {
            setValue("role", value as "FACULTY" | "INTERVIEWER", {
              shouldValidate: true,
              shouldTouch: true,
              shouldDirty: true,
            });
            void trigger("role");
          }}
          options={[
            { label: "Faculty", value: "FACULTY" },
            { label: "Interviewer", value: "INTERVIEWER" },
          ]}
        />
      </ValidatedField>

      {selectedTrainer ? (
        <div className="md:col-span-2 rounded-xl border border-[#E8EEF5] bg-[#F8FBFF] px-3 py-2.5 text-sm text-[#647A9B]">
          <p className="font-medium text-[#102A56]">
            {trainerLabel(selectedTrainer)}
          </p>
          {selectedTrainer.phone ? (
            <p className="mt-0.5">Phone: {selectedTrainer.phone}</p>
          ) : null}
          {selectedTrainer.hasAccount &&
          selectedTrainer.linkedBranchUserId !== user?.id ? (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <p className="text-xs text-amber-800">
                This trainer already has a branch user account.
              </p>
              {selectedTrainer.linkedBranchUserId ? (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 text-xs"
                  onClick={() => {
                    onEditExistingUser?.(selectedTrainer.linkedBranchUserId!);
                  }}
                >
                  Edit existing user
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <ValidatedField
        htmlId="branch-staff-email"
        label="Email"
        required
        leftIcon={<Mail className="h-4 w-4" />}
        state={visual("email")}
        errorMessage={fieldMessage("email")}
      >
        <Input
          type="email"
          placeholder="Enter email for trainer login"
          autoComplete="email"
          className={validatedFieldInputClass(visual("email"), undefined, {
            leftIcon: true,
          })}
          {...register("email")}
        />
      </ValidatedField>

      <ValidatedField
        htmlId="branch-staff-password"
        label="Password"
        required={!isEdit}
        passwordToggle
        leftIcon={<Lock className="h-4 w-4" />}
        state={visual("password")}
        errorMessage={fieldMessage("password")}
      >
        <PasswordInput
          placeholder={
            isEdit ? "Enter new password (optional)" : "Enter password"
          }
          autoComplete={isEdit ? "new-password" : "new-password"}
          className={validatedFieldInputClass(
            visual("password"),
            undefined,
            { leftIcon: true, passwordToggle: true },
          )}
          {...register("password")}
        />
      </ValidatedField>

      {trainerNeedsPhone ? (
        <ValidatedField
          htmlId="branch-staff-phone"
          label="Phone"
          required
          leftIcon={<Phone className="h-4 w-4" />}
          state={visual("phone")}
          errorMessage={fieldMessage("phone")}
        >
          <Input
            placeholder="Enter trainer phone number"
            autoComplete="tel"
            inputMode="numeric"
            className={validatedFieldInputClass(visual("phone"), undefined, {
              leftIcon: true,
            })}
            {...register("phone")}
          />
        </ValidatedField>
      ) : null}
    </>
  );

  return (
    <>
      <Modal
        open={open}
        title={isEdit ? "Edit User" : "Create User"}
        onClose={onClose}
        contentClassName="max-w-2xl"
        footer={
          <>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              className="admin-create-btn h-11 px-5"
              loading={isSubmitting}
              disabled={
                isSubmitting ||
                trainersLoading ||
                !hasAssignedTrainers ||
                (!isEdit && selectedTrainer?.hasAccount) ||
                (isEdit &&
                  selectedTrainer?.hasAccount &&
                  selectedTrainer.linkedBranchUserId !== user?.id)
              }
              onClick={handleSubmit(onSubmit, (formErrors) =>
                focusFirstInvalid(formErrors),
              )}
            >
              {isEdit ? "Save changes" : "Create User"}
            </Button>
          </>
        }
      >
        <form
          className="grid gap-x-4 md:grid-cols-2"
          onSubmit={handleSubmit(onSubmit, (formErrors) =>
            focusFirstInvalid(formErrors),
          )}
          noValidate
        >
          {trainerFieldBlock}
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(restoreValues && restoreValues.mode === "create")}
        title="Restore User?"
        description="An inactive account already exists with this email. Creating this user will restore and update that account."
        confirmLabel="Restore & Update"
        confirmVariant="primary"
        loading={isSubmitting || restoreLoading}
        onConfirm={() => {
          if (!restoreValues || restoreValues.mode !== "create") return;
          void submitCreate(restoreValues, true);
        }}
        onCancel={() => {
          if (!isSubmitting && !restoreLoading) setRestoreValues(null);
        }}
      />
    </>
  );
}

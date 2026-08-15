import { z } from "zod";

import {
  BRANCH_USER_ROLES,
} from "@/src/features/branch-users/constants/branch-user.constants";

const phoneRegex = /^[6-9]\d{9}$/;

export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

export const branchUserPasswordSchema = z
  .string()
  .regex(
    passwordRegex,
    "Password must contain uppercase, lowercase, number and special character"
  );

export const createBranchUserSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(
        2,
        "First name is required"
      )
      .max(
        50,
        "Maximum 50 characters allowed"
      ),

    lastName: z
      .string()
      .trim()
      .min(
        2,
        "Last name is required"
      )
      .max(
        50,
        "Maximum 50 characters allowed"
      ),

    email: z
      .string()
      .trim()
      .email(
        "Enter valid email address"
      ),

    phone: z
      .string()
      .regex(
        phoneRegex,
        "Enter valid mobile number"
      ),

    password: branchUserPasswordSchema,

    role: z.enum(
      BRANCH_USER_ROLES,
      {
        error: "Role is required",
      }
    ),

    branchId: z
      .string()
      .uuid(
        "Invalid branch selected"
      ),

    permissions: z.array(
      z.string()
    ),
  });

export const createBranchUserFormSchema =
  createBranchUserSchema
    .extend({
      confirmPassword: z
        .string()
        .min(
          1,
          "Confirm password is required"
        ),
    })
    .refine(
      (data) =>
        data.password ===
        data.confirmPassword,
      {
        message:
          "Passwords do not match.",
        path: ["confirmPassword"],
      }
    );

export const resetPasswordFormSchema = z
  .object({
    newPassword: branchUserPasswordSchema,
    confirmPassword: z
      .string()
      .min(
        1,
        "Confirm password is required"
      ),
  })
  .superRefine((data, ctx) => {
    if (!data.confirmPassword.trim()) {
      return;
    }

    if (
      !passwordRegex.test(
        data.newPassword
      )
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Password must contain uppercase, lowercase, number and special character",
        path: ["confirmPassword"],
      });
      return;
    }

    if (
      data.newPassword !==
      data.confirmPassword
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Passwords do not match.",
        path: ["confirmPassword"],
      });
    }
  });

export const updateBranchUserSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    lastName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    email: z
      .string()
      .trim()
      .email(),

    phone: z
      .string()
      .regex(phoneRegex),

    role: z.enum(
      BRANCH_USER_ROLES
    ),

    branchId: z
      .string()
      .uuid(),

    permissions: z.array(
      z.string()
    ),
  });

export type CreateBranchUserFormValues =
  z.infer<
    typeof createBranchUserFormSchema
  >;

export type UpdateBranchUserFormValues =
  z.infer<
    typeof updateBranchUserSchema
  >;

export type ResetPasswordFormValues =
  z.infer<
    typeof resetPasswordFormSchema
  >;
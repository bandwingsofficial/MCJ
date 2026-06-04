import { z } from "zod";

import {
  BRANCH_USER_ROLES,
} from "@/src/features/branch-users/constants/branch-user.constants";

const phoneRegex = /^[6-9]\d{9}$/;

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

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

    password: z
      .string()
      .regex(
        passwordRegex,
        "Password must contain uppercase, lowercase, number and special character"
      ),

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
    typeof createBranchUserSchema
  >;

export type UpdateBranchUserFormValues =
  z.infer<
    typeof updateBranchUserSchema
  >;
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/src/shared/components/ui/button";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

import { useRegister } from "@/src/features/auth/hooks/use-register";

import {
  registerSchema,
  RegisterFormValues,
} from "@/src/features/auth/schemas/register.schema";

export function RegisterForm() {
  const registerMutation =
    useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver:
      zodResolver(registerSchema),
  });

  const onSubmit = (
    data: RegisterFormValues
  ) => {
    registerMutation.mutate(data);
  };

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit
      )}
      className="space-y-5"
    >
      <div>
        <Label required>
          Full Name
        </Label>

        <Input
          placeholder="Enter full name"
          {...register("name")}
        />

        <FormError
          message={
            errors.name?.message
          }
        />
      </div>

      <div>
        <Label required>
          Email
        </Label>

        <Input
          placeholder="Enter email"
          {...register("email")}
        />

        <FormError
          message={
            errors.email?.message
          }
        />
      </div>

      <div>
        <Label required>
          Phone Number
        </Label>

        <Input
          placeholder="Enter phone number"
          {...register("phone")}
        />

        <FormError
          message={
            errors.phone?.message
          }
        />
      </div>

      <div>
        <Label required>
          Password
        </Label>

        <Input
          type="password"
          placeholder="Enter password"
          {...register("password")}
        />

        <FormError
          message={
            errors.password
              ?.message
          }
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        loading={
          registerMutation.isPending
        }
      >
        Create Account
      </Button>
    </form>
  );
}
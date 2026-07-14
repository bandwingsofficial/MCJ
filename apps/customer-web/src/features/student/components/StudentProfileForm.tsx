"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { AppSelect } from "@/src/shared/components/ui/select";
import { GENDER_OPTIONS } from "@/src/features/student/constants";
import { createStudentProfileSchema, type CreateStudentProfileFormValues } from "@/src/features/student/schemas";
import { useCreateStudentProfile, useStudentProfile, useUpdateStudentProfile } from "@/src/features/student/hooks";

interface StudentProfileFormProps {
  isEditing?: boolean;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function StudentProfileForm({
  isEditing = true,
  onCancel,
  onSuccess,
}: StudentProfileFormProps) {
  const { profile, refetch } = useStudentProfile();
  const { createProfile, isSubmitting: isCreating } = useCreateStudentProfile();
  const { updateProfile, isSubmitting: isUpdating } = useUpdateStudentProfile();

  const form = useForm<CreateStudentProfileFormValues>({
    resolver: zodResolver(createStudentProfileSchema),
    defaultValues: {
      firstName: "", lastName: "", email: "", phone: "", gender: "MALE",
      dateOfBirth: "", addressLine1: "", addressLine2: "", city: "", state: "",
      country: "India", postalCode: "", qualification: "", collegeName: "",
      specialization: "", passingYear: new Date().getFullYear(), parentName: "",
      parentPhone: "", emergencyContactName: "", emergencyContactPhone: "", notes: "",
    },
  });

  const { register, setValue, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!profile) return;
    reset({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      gender: profile.gender,
      dateOfBirth: profile.dateOfBirth.split("T")[0],
      addressLine1: profile.addressLine1,
      addressLine2: profile.addressLine2 ?? "",
      city: profile.city,
      state: profile.state,
      country: profile.country,
      postalCode: profile.postalCode,
      qualification: profile.qualification,
      collegeName: profile.collegeName,
      specialization: profile.specialization,
      passingYear: profile.passingYear,
      parentName: profile.parentName,
      parentPhone: profile.parentPhone,
      emergencyContactName: profile.emergencyContactName,
      emergencyContactPhone: profile.emergencyContactPhone,
      notes: profile.notes ?? "",
    });
  }, [profile, reset]);

  const isSubmitting = isCreating || isUpdating;

  return (
    // Updated container classes to prevent overlap issues
    <div className="w-full max-w-4xl mx-auto my-8 px-4">
      <Card className="p-5 md:p-6 shadow-sm overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            {profile ? (isEditing ? "Update Student Profile" : "Student Profile") : "Create Student Profile"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {profile ? (isEditing ? "Update your profile information." : "Review your profile information.") : "Complete your profile to continue with courses and placements."}
          </p>
        </div>

        <form className="space-y-6" onSubmit={form.handleSubmit(async (values) => {
          try {
            if (profile) {
              await updateProfile({
                qualification: values.qualification,
                collegeName: values.collegeName,
                specialization: values.specialization,
                passingYear: values.passingYear,
                parentName: values.parentName,
                parentPhone: values.parentPhone,
                emergencyContactName: values.emergencyContactName,
                emergencyContactPhone: values.emergencyContactPhone,
                notes: values.notes,
              });
              appToast.success("Profile updated successfully.");
            } else {
              await createProfile(values);
              appToast.success("Profile created successfully.");
            }
            await refetch();
            onSuccess?.();
          } catch (error) {
            appToast.error(error instanceof Error ? error.message : "Failed to save profile.");
          }
        })}>
          
          {[
            { title: "Personal Information", content: (
              <div className="grid gap-4 md:grid-cols-2">
                {[ {label: "First Name", id: "firstName"}, {label: "Last Name", id: "lastName"}, 
                   {label: "Email", id: "email"}, {label: "Phone Number", id: "phone"} ].map(f => (
                  <div key={f.id}>
                    <Label required>{f.label}</Label>
                    <Input {...register(f.id as keyof CreateStudentProfileFormValues)} placeholder={`Enter ${f.label.toLowerCase()}`} />
                    <FormError message={errors[f.id as keyof CreateStudentProfileFormValues]?.message as string} />
                  </div>
                ))}
                <div>
                  <Label required>Gender</Label>
                  <AppSelect value={form.watch("gender")} options={GENDER_OPTIONS} onValueChange={(v) => setValue("gender", v as any, { shouldValidate: true })} />
                  <FormError message={errors.gender?.message as string} />
                </div>
                <div>
                  <Label required>Date of Birth</Label>
                  <Input type="date" {...register("dateOfBirth")} />
                  <FormError message={errors.dateOfBirth?.message as string} />
                </div>
              </div>
            )},
            { title: "Address Information", content: (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2"><Label required>Address Line 1</Label><Input {...register("addressLine1")} /><FormError message={errors.addressLine1?.message as string} /></div>
                <div className="md:col-span-2"><Label>Address Line 2</Label><Input {...register("addressLine2")} /><FormError message={errors.addressLine2?.message as string} /></div>
                {["city", "state", "country", "postalCode"].map(f => (
                  <div key={f}>
                    <Label required>{f.charAt(0).toUpperCase() + f.slice(1)}</Label>
                    <Input {...register(f as keyof CreateStudentProfileFormValues)} />
                    <FormError message={errors[f as keyof CreateStudentProfileFormValues]?.message as string} />
                  </div>
                ))}
              </div>
            )},
            { title: "Education Details", content: (
              <div className="grid gap-4 md:grid-cols-2">
                {["qualification", "collegeName", "specialization", "passingYear"].map(f => (
                  <div key={f}>
                    <Label required>{f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                    <Input type={f === "passingYear" ? "number" : "text"} {...register(f as keyof CreateStudentProfileFormValues)} />
                    <FormError message={errors[f as keyof CreateStudentProfileFormValues]?.message as string} />
                  </div>
                ))}
              </div>
            )},
            { title: "Parent / Guardian Details", content: (
              <div className="grid gap-4 md:grid-cols-2">
                {["parentName", "parentPhone"].map(f => (
                  <div key={f}>
                    <Label required>{f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                    <Input {...register(f as keyof CreateStudentProfileFormValues)} />
                    <FormError message={errors[f as keyof CreateStudentProfileFormValues]?.message as string} />
                  </div>
                ))}
              </div>
            )},
            { title: "Emergency Contact", content: (
              <div className="grid gap-4 md:grid-cols-2">
                {["emergencyContactName", "emergencyContactPhone"].map(f => (
                  <div key={f}>
                    <Label required>{f.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</Label>
                    <Input {...register(f as keyof CreateStudentProfileFormValues)} />
                    <FormError message={errors[f as keyof CreateStudentProfileFormValues]?.message as string} />
                  </div>
                ))}
              </div>
            )}
          ].map((section) => (
            <section key={section.title} className="space-y-3">
              <h3 className="text-base font-semibold border-b pb-1">{section.title}</h3>
              {section.content}
            </section>
          ))}

          <section className="space-y-3">
            <h3 className="text-base font-semibold border-b pb-1">Additional Notes</h3>
            <Textarea {...register("notes")} rows={3} placeholder="Additional information..." />
            <FormError message={errors.notes?.message as string} />
          </section>

          <div className="flex justify-end gap-3 border-t pt-4">
            {profile && isEditing && (
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
            )}
            <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
              {profile ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
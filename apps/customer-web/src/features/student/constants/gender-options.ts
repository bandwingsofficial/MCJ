import type { Gender } from "@/src/features/student/types";

export interface GenderOption {
  label: string;

  value: Gender;
}

export const GENDER_OPTIONS: GenderOption[] = [
  {
    label: "Male",
    value: "MALE",
  },
  {
    label: "Female",
    value: "FEMALE",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];
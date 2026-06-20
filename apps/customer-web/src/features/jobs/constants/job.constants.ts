import type {
  EmploymentType,
} from "@/src/features/jobs/types/job.types";

export const JOB_QUERY_KEY = [
  "jobs",
] as const;

export const JOB_DETAIL_QUERY_KEY = (
  slug: string,
) =>
  [
    "jobs",
    "detail",
    slug,
  ] as const;

export const EMPLOYMENT_TYPES: {
  value: EmploymentType;
  label: string;
}[] = [
  {
    value: "FULL_TIME",
    label: "Full Time",
  },
  {
    value: "PART_TIME",
    label: "Part Time",
  },
  {
    value: "CONTRACT",
    label: "Contract",
  },
  {
    value: "INTERNSHIP",
    label: "Internship",
  },
  {
    value: "FREELANCE",
    label: "Freelance",
  },
];
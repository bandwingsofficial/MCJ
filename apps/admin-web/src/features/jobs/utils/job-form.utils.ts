import type {
  InterviewProcess,
} from "@/src/features/jobs/types/job.types";
import type { CreateJobFormValues } from "../schemas/job.schema";
export class JobFormUtils {
  static stringToArray(
    value: string,
  ): string[] {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  static arrayToString(
    values: string[],
  ): string {
    return values.join("\n");
  }

  static createEmptyInterview(): InterviewProcess {
    return {
      title: "",
      description: "",
    };
  }

  static normalizeInterviewProcess(
    items: InterviewProcess[],
  ): InterviewProcess[] {
    return items
      .map((item) => ({
        title: item.title.trim(),
        description:
          item.description.trim(),
      }))
      .filter(
        (item) =>
          item.title.length > 0 &&
          item.description.length > 0,
      );
  }

  static normalizeStringArray(
    values: string[],
  ): string[] {
    return values
      .map((item) => item.trim())
      .filter(Boolean);
  }

static createDefaultValues(): CreateJobFormValues {
    return {
      title: "",

      companyName: "",

      companyLogo: "",

      companyWebsite: "",

      companyDescription: "",

      shortDescription: "",

      description: "",

      location: "",

      city: "",

      state: "",

      country: "",

      isRemote: false,

      employmentType: "FULL_TIME",

workingDays: "MONDAY_TO_FRIDAY",

status: "DRAFT",

      minExperience: 0,

      maxExperience: 0,

      minSalary: 0,

      maxSalary: 0,

      salaryCurrency: "INR",

      vacancies: 1,

      applicationDeadline: "",

      responsibilities: "",

skills: "",

      eligibilityTitle: "",

      interviewProcess: [
        JobFormUtils.createEmptyInterview(),
      ],
    };
  }
}
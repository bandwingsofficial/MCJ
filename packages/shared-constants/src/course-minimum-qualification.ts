/**
 * Course minimum qualification enum values (persisted on Course.minimumQualifications).
 * Labels must stay stable for existing records.
 */
export const COURSE_MINIMUM_QUALIFICATION_VALUES = [
  "TENTH_PASS",
  "TENTH_SSLC_PASS",
  "TWELFTH_PASS",
  "TWELFTH_PUC_PASS",
  "TWELFTH_INTERMEDIATE_PASS",
  "TWELFTH_COMMERCE",
  "TWELFTH_SCIENCE",
  "TWELFTH_ARTS",
  "ANY_DIPLOMA",
  "DIPLOMA_COMMERCE",
  "DIPLOMA_ACCOUNTING",
  "DIPLOMA_ACCOUNTING_FINANCE",
  "DIPLOMA_BANKING_FINANCE",
  "DIPLOMA_TAXATION",
  "DIPLOMA_BUSINESS_MANAGEMENT",
  "DIPLOMA_COMPUTER_APPLICATIONS",
  "DIPLOMA_INFORMATION_TECHNOLOGY",
  "DIPLOMA_BUSINESS_ADMINISTRATION",
  "DIPLOMA_FINANCIAL_MANAGEMENT",
  "B_COM",
  "B_COM_ACCOUNTING_FINANCE",
  "B_COM_BANKING_FINANCE",
  "B_COM_COMPUTER_APPLICATIONS",
  "B_COM_CORPORATE_SECRETARSHIP",
  "B_COM_TAXATION",
  "B_COM_FINANCE",
  "B_COM_INTERNATIONAL_BUSINESS",
  "B_COM_BUSINESS_ANALYTICS",
  "B_COM_PROFESSIONAL",
  "ANY_COMMERCE_DEGREE",
  "ANY_ACCOUNTING_DEGREE",
  "ANY_FINANCE_DEGREE",
  "BBA",
  "BBM",
  "BMS",
  "BBA_FINANCE",
  "BBA_ACCOUNTING",
  "BBA_BANKING_FINANCE",
  "BBA_BUSINESS_ANALYTICS",
  "ANY_MANAGEMENT_DEGREE",
  "BCA",
  "BSC_COMPUTER_SCIENCE",
  "BSC_INFORMATION_TECHNOLOGY",
  "BSC_COMPUTER_APPLICATIONS",
  "BTECH_BE_COMPUTER_SCIENCE",
  "BTECH_BE_INFORMATION_TECHNOLOGY",
  "ANY_COMPUTER_IT_DEGREE",
  "BA",
  "BSC",
  "BTECH",
  "BE",
  "LLB",
  "ANY_BACHELORS_DEGREE",
  "ANY_GRADUATE",
  "M_COM",
  "M_COM_ACCOUNTING_FINANCE",
  "M_COM_FINANCE",
  "MBA",
  "MBA_FINANCE",
  "MBA_ACCOUNTING",
  "MBA_BUSINESS_MANAGEMENT",
  "MBA_BANKING_FINANCE",
  "MCA",
  "MSC",
  "MA",
  "ME_MTECH",
  "LLM",
  "ANY_MASTERS_DEGREE",
  "ANY_POSTGRADUATE",
  "CA",
  "CA_FOUNDATION",
  "CMA",
  "CS",
  "ACCA",
  "CFA",
  "CPA",
  "CIMA",
  "ANY_PROFESSIONAL_QUALIFICATION",
  "GST_CERTIFICATION",
  "ACCOUNTING_CERTIFICATION",
  "TAXATION_CERTIFICATION",
  "BANKING_CERTIFICATION",
  "FINANCE_CERTIFICATION",
  "COMPUTER_IT_CERTIFICATION",
  "TALLY_CERTIFICATION",
  "RELEVANT_INDUSTRY_CERTIFICATION",
  "RELEVANT_WORK_EXPERIENCE",
  "ANY_DEGREE_DIPLOMA",
  "DEGREE_DIPLOMA_RELEVANT_FIELD",
  "RELEVANT_EDUCATIONAL_BACKGROUND",
  "NO_SPECIFIC_QUALIFICATION_REQUIRED",
  "OTHER",
] as const;

export type CourseMinimumQualification =
  (typeof COURSE_MINIMUM_QUALIFICATION_VALUES)[number];

export const COURSE_MINIMUM_QUALIFICATION_LABELS: Record<
  CourseMinimumQualification,
  string
> = {
  TENTH_PASS: "10th Pass",
  TENTH_SSLC_PASS: "10th / SSLC Pass",
  TWELFTH_PASS: "12th Pass",
  TWELFTH_PUC_PASS: "12th / PUC Pass",
  TWELFTH_INTERMEDIATE_PASS: "12th / Intermediate Pass",
  TWELFTH_COMMERCE: "12th – Commerce",
  TWELFTH_SCIENCE: "12th – Science",
  TWELFTH_ARTS: "12th – Arts",
  ANY_DIPLOMA: "Any Diploma",
  DIPLOMA_COMMERCE: "Diploma in Commerce",
  DIPLOMA_ACCOUNTING: "Diploma in Accounting",
  DIPLOMA_ACCOUNTING_FINANCE: "Diploma in Accounting & Finance",
  DIPLOMA_BANKING_FINANCE: "Diploma in Banking & Finance",
  DIPLOMA_TAXATION: "Diploma in Taxation",
  DIPLOMA_BUSINESS_MANAGEMENT: "Diploma in Business Management",
  DIPLOMA_COMPUTER_APPLICATIONS: "Diploma in Computer Applications",
  DIPLOMA_INFORMATION_TECHNOLOGY: "Diploma in Information Technology",
  DIPLOMA_BUSINESS_ADMINISTRATION: "Diploma in Business Administration",
  DIPLOMA_FINANCIAL_MANAGEMENT: "Diploma in Financial Management",
  B_COM: "B.Com",
  B_COM_ACCOUNTING_FINANCE: "B.Com – Accounting & Finance",
  B_COM_BANKING_FINANCE: "B.Com – Banking & Finance",
  B_COM_COMPUTER_APPLICATIONS: "B.Com – Computer Applications",
  B_COM_CORPORATE_SECRETARSHIP: "B.Com – Corporate Secretaryship",
  B_COM_TAXATION: "B.Com – Taxation",
  B_COM_FINANCE: "B.Com – Finance",
  B_COM_INTERNATIONAL_BUSINESS: "B.Com – International Business",
  B_COM_BUSINESS_ANALYTICS: "B.Com – Business Analytics",
  B_COM_PROFESSIONAL: "B.Com – Professional",
  ANY_COMMERCE_DEGREE: "Any Commerce Degree",
  ANY_ACCOUNTING_DEGREE: "Any Accounting Degree",
  ANY_FINANCE_DEGREE: "Any Finance Degree",
  BBA: "BBA",
  BBM: "BBM",
  BMS: "BMS",
  BBA_FINANCE: "BBA – Finance",
  BBA_ACCOUNTING: "BBA – Accounting",
  BBA_BANKING_FINANCE: "BBA – Banking & Finance",
  BBA_BUSINESS_ANALYTICS: "BBA – Business Analytics",
  ANY_MANAGEMENT_DEGREE: "Any Management Degree",
  BCA: "BCA",
  BSC_COMPUTER_SCIENCE: "B.Sc – Computer Science",
  BSC_INFORMATION_TECHNOLOGY: "B.Sc – Information Technology",
  BSC_COMPUTER_APPLICATIONS: "B.Sc – Computer Applications",
  BTECH_BE_COMPUTER_SCIENCE: "B.Tech / BE – Computer Science",
  BTECH_BE_INFORMATION_TECHNOLOGY: "B.Tech / BE – Information Technology",
  ANY_COMPUTER_IT_DEGREE: "Any Computer / IT Degree",
  BA: "BA",
  BSC: "B.Sc",
  BTECH: "B.Tech",
  BE: "BE",
  LLB: "LLB",
  ANY_BACHELORS_DEGREE: "Any Bachelor's Degree",
  ANY_GRADUATE: "Any Graduate",
  M_COM: "M.Com",
  M_COM_ACCOUNTING_FINANCE: "M.Com – Accounting & Finance",
  M_COM_FINANCE: "M.Com – Finance",
  MBA: "MBA",
  MBA_FINANCE: "MBA – Finance",
  MBA_ACCOUNTING: "MBA – Accounting",
  MBA_BUSINESS_MANAGEMENT: "MBA – Business Management",
  MBA_BANKING_FINANCE: "MBA – Banking & Finance",
  MCA: "MCA",
  MSC: "M.Sc",
  MA: "MA",
  ME_MTECH: "ME / M.Tech",
  LLM: "LLM",
  ANY_MASTERS_DEGREE: "Any Master's Degree",
  ANY_POSTGRADUATE: "Any Postgraduate",
  CA: "CA – Chartered Accountant",
  CA_FOUNDATION: "CA Foundation",
  CMA: "CMA – Cost and Management Accountant",
  CS: "CS – Company Secretary",
  ACCA: "ACCA",
  CFA: "CFA",
  CPA: "CPA",
  CIMA: "CIMA",
  ANY_PROFESSIONAL_QUALIFICATION: "Any Professional Qualification",
  GST_CERTIFICATION: "GST Certification",
  ACCOUNTING_CERTIFICATION: "Accounting Certification",
  TAXATION_CERTIFICATION: "Taxation Certification",
  BANKING_CERTIFICATION: "Banking Certification",
  FINANCE_CERTIFICATION: "Finance Certification",
  COMPUTER_IT_CERTIFICATION: "Computer / IT Certification",
  TALLY_CERTIFICATION: "Tally Certification",
  RELEVANT_INDUSTRY_CERTIFICATION: "Relevant Industry Certification",
  RELEVANT_WORK_EXPERIENCE: "Relevant Work Experience",
  ANY_DEGREE_DIPLOMA: "Any Degree / Diploma",
  DEGREE_DIPLOMA_RELEVANT_FIELD: "Degree / Diploma in Relevant Field",
  RELEVANT_EDUCATIONAL_BACKGROUND: "Relevant Educational Background",
  NO_SPECIFIC_QUALIFICATION_REQUIRED: "No Specific Qualification Required",
  OTHER: "Other",
};

export type CourseMinimumQualificationGroup = {
  id: string;
  label: string;
  values: readonly string[];
};

export const COURSE_MINIMUM_QUALIFICATION_GROUPS: readonly CourseMinimumQualificationGroup[] =
  [
    {
      id: "school",
      label: "School / Higher Secondary",
      values: [
        "TENTH_PASS",
        "TENTH_SSLC_PASS",
        "TWELFTH_PASS",
        "TWELFTH_PUC_PASS",
        "TWELFTH_INTERMEDIATE_PASS",
        "TWELFTH_COMMERCE",
        "TWELFTH_SCIENCE",
        "TWELFTH_ARTS",
      ],
    },
    {
      id: "diploma",
      label: "Diploma",
      values: [
        "ANY_DIPLOMA",
        "DIPLOMA_COMMERCE",
        "DIPLOMA_ACCOUNTING",
        "DIPLOMA_ACCOUNTING_FINANCE",
        "DIPLOMA_BANKING_FINANCE",
        "DIPLOMA_TAXATION",
        "DIPLOMA_BUSINESS_MANAGEMENT",
        "DIPLOMA_COMPUTER_APPLICATIONS",
        "DIPLOMA_INFORMATION_TECHNOLOGY",
        "DIPLOMA_BUSINESS_ADMINISTRATION",
        "DIPLOMA_FINANCIAL_MANAGEMENT",
      ],
    },
    {
      id: "commerce",
      label: "Commerce & Accounting Degrees",
      values: [
        "B_COM",
        "B_COM_ACCOUNTING_FINANCE",
        "B_COM_BANKING_FINANCE",
        "B_COM_COMPUTER_APPLICATIONS",
        "B_COM_CORPORATE_SECRETARSHIP",
        "B_COM_TAXATION",
        "B_COM_FINANCE",
        "B_COM_INTERNATIONAL_BUSINESS",
        "B_COM_BUSINESS_ANALYTICS",
        "B_COM_PROFESSIONAL",
        "ANY_COMMERCE_DEGREE",
        "ANY_ACCOUNTING_DEGREE",
        "ANY_FINANCE_DEGREE",
      ],
    },
    {
      id: "management",
      label: "Management Degrees",
      values: [
        "BBA",
        "BBM",
        "BMS",
        "BBA_FINANCE",
        "BBA_ACCOUNTING",
        "BBA_BANKING_FINANCE",
        "BBA_BUSINESS_ANALYTICS",
        "ANY_MANAGEMENT_DEGREE",
      ],
    },
    {
      id: "computer",
      label: "Computer / IT Degrees",
      values: [
        "BCA",
        "BSC_COMPUTER_SCIENCE",
        "BSC_INFORMATION_TECHNOLOGY",
        "BSC_COMPUTER_APPLICATIONS",
        "BTECH_BE_COMPUTER_SCIENCE",
        "BTECH_BE_INFORMATION_TECHNOLOGY",
        "ANY_COMPUTER_IT_DEGREE",
      ],
    },
    {
      id: "bachelors",
      label: "Other Bachelor's Degrees",
      values: [
        "BA",
        "BSC",
        "BTECH",
        "BE",
        "LLB",
        "ANY_BACHELORS_DEGREE",
        "ANY_GRADUATE",
      ],
    },
    {
      id: "postgraduate",
      label: "Postgraduate",
      values: [
        "M_COM",
        "M_COM_ACCOUNTING_FINANCE",
        "M_COM_FINANCE",
        "MBA",
        "MBA_FINANCE",
        "MBA_ACCOUNTING",
        "MBA_BUSINESS_MANAGEMENT",
        "MBA_BANKING_FINANCE",
        "MCA",
        "MSC",
        "MA",
        "ME_MTECH",
        "LLM",
        "ANY_MASTERS_DEGREE",
        "ANY_POSTGRADUATE",
      ],
    },
    {
      id: "professional",
      label: "Professional Qualifications",
      values: [
        "CA",
        "CMA",
        "CS",
        "ACCA",
        "CFA",
        "CPA",
        "CIMA",
        "CA_FOUNDATION",
        "ANY_PROFESSIONAL_QUALIFICATION",
      ],
    },
    {
      id: "specialized",
      label: "Specialized / Certification",
      values: [
        "GST_CERTIFICATION",
        "ACCOUNTING_CERTIFICATION",
        "TAXATION_CERTIFICATION",
        "BANKING_CERTIFICATION",
        "FINANCE_CERTIFICATION",
        "COMPUTER_IT_CERTIFICATION",
        "TALLY_CERTIFICATION",
        "RELEVANT_INDUSTRY_CERTIFICATION",
        "RELEVANT_WORK_EXPERIENCE",
      ],
    },
    {
      id: "general",
      label: "General Eligibility",
      values: [
        "ANY_DEGREE_DIPLOMA",
        "DEGREE_DIPLOMA_RELEVANT_FIELD",
        "RELEVANT_EDUCATIONAL_BACKGROUND",
        "NO_SPECIFIC_QUALIFICATION_REQUIRED",
        "OTHER",
      ],
    },
  ];

const VALUE_SET = new Set<string>(COURSE_MINIMUM_QUALIFICATION_VALUES);

export function isCourseMinimumQualification(
  value: string,
): value is CourseMinimumQualification {
  return VALUE_SET.has(value);
}

export function getCourseMinimumQualificationLabel(
  value: string,
): string {
  if (isCourseMinimumQualification(value)) {
    return COURSE_MINIMUM_QUALIFICATION_LABELS[value];
  }

  return value;
}

function normalizeSearchTerm(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function labelWords(label: string): string[] {
  return label
    .split(/[\s/–\-,&]+/)
    .map((part) => normalizeSearchTerm(part))
    .filter(Boolean);
}

export function courseMinimumQualificationMatchesSearch(
  qualification: CourseMinimumQualification,
  rawQuery: string,
): boolean {
  const query = normalizeSearchTerm(rawQuery.trim());
  if (!query) {
    return true;
  }

  const label = COURSE_MINIMUM_QUALIFICATION_LABELS[qualification];
  const normalizedLabel = normalizeSearchTerm(label);
  const normalizedKey = normalizeSearchTerm(qualification);

  if (query.length <= 3) {
    if (normalizedKey === query) {
      return true;
    }

    if (normalizedLabel.startsWith(query)) {
      return true;
    }

    return labelWords(label).some(
      (word) => word === query || word.startsWith(query),
    );
  }

  if (normalizedLabel.includes(query) || normalizedKey.includes(query)) {
    return true;
  }

  return labelWords(label).some((word) => word.includes(query));
}

export function filterCourseMinimumQualificationGroups(
  rawQuery: string,
): CourseMinimumQualificationGroup[] {
  const query = rawQuery.trim();
  if (!query) {
    return [...COURSE_MINIMUM_QUALIFICATION_GROUPS];
  }

  return COURSE_MINIMUM_QUALIFICATION_GROUPS.map((group) => ({
    ...group,
    values: group.values.filter((value) => {
      if (!isCourseMinimumQualification(value)) {
        return false;
      }

      return courseMinimumQualificationMatchesSearch(value, query);
    }),
  })).filter((group) => group.values.length > 0);
}

/** Legacy / unknown saved values still shown when editing. */
export function buildLegacyCourseMinimumQualificationGroup(
  values: readonly string[],
): CourseMinimumQualificationGroup | null {
  const legacy = values.filter(
    (value) => value.trim() && !isCourseMinimumQualification(value),
  );

  if (legacy.length === 0) {
    return null;
  }

  return {
    id: "legacy",
    label: "Saved values",
    values: legacy,
  };
}

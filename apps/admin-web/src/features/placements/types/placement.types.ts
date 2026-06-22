export const PLACEMENT_STATUSES = [
  "PENDING",
  "JOINED",
] as const;

export type PlacementStatus =
  (typeof PLACEMENT_STATUSES)[number];

export interface PlacementJob {
  id: string;

  title: string;

  slug: string;

  companyName: string;
}

export interface PlacementStudent {
  id: string;

  firstName: string;

  lastName: string;

  studentCode: string;

  status: string;
}

export interface Placement {
  id: string;

  jobId: string;

  applicationId: string;

  studentId: string;

  companyName: string;

  designation: string;

  salary: number;

  joiningDate: string | null;

  remarks: string | null;

  status: PlacementStatus;

  job: PlacementJob;

  student: PlacementStudent;

  createdAt: string;

  updatedAt: string;
}

export interface PlacementListResponse {
  success: boolean;

  message: string;

  data: Placement[];
}

export interface PlacementResponse {
  success: boolean;

  message: string;

  data: Placement;
}

export interface UpdatePlacementRequest {
  status: PlacementStatus;

  joiningDate?: string | null;

  remarks?: string | null;
}

export interface UpdatePlacementResponse {
  success: boolean;

  message: string;

  data: Placement;
}
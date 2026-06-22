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

  status: string;

  job: PlacementJob;

  student: PlacementStudent;

  createdAt: string;

  updatedAt: string;
}
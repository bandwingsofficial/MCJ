export interface TrainerBranch {
  id: string;
  branchName: string;
  branchCode: string;
}

export interface TrainerCourse {
  id: string;
  title: string;
}

export interface Trainer {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string;

  gender: string;

  bio: string | null;

  qualification: string | null;

  experienceYears: number;

  specialization: string | null;

  skills: string[];

  profileImageFileId: string | null;

  profileImageUrl: string | null;

  employeeCode: string;

  trainerType: string;

  linkedInUrl: string | null;

  youtubeUrl: string | null;

  instagramUrl: string | null;

  branch: TrainerBranch | null;

  averageRating: number;

  totalReviews: number;

  isFeatured: boolean;

  status: string;

  joinedAt: string;

  courses: TrainerCourse[];

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}
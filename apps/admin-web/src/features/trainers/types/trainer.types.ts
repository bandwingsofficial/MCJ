export type TrainerGender =
  | "MALE"
  | "FEMALE"
  | "OTHER";

export type TrainerType =
  | "FULL_TIME"
  | "PART_TIME"
  | "VISITING"
  | "GUEST"
  | "ONLINE";

export type TrainerStatus =
  | "ACTIVE"
  | "INACTIVE";

export interface TrainerCourse {
  id: string;

  title: string;
}

export interface Trainer {
  id: string;

  firstName: string;

  lastName: string | null;

  email: string | null;

  phone: string | null;

  gender: TrainerGender | null;

  bio: string | null;

  qualification: string | null;

  experienceYears: number | null;

  specialization: string | null;

  skills: string[];

  profileImageFileId: string | null;

  profileImageUrl: string | null;

  employeeCode: string | null;

  trainerType: TrainerType;

  linkedInUrl: string | null;

  youtubeUrl: string | null;

  instagramUrl: string | null;

  branchId: string | null;

  averageRating: number;

  totalReviews: number;

  isFeatured: boolean;

  status: TrainerStatus;

  joinedAt: string | null;

  courses: TrainerCourse[];

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface TrainerListItem
  extends Trainer {}

export interface TrainerDetails
  extends Trainer {}

export interface TrainerFilters {
  search: string;

  branchId?: string;

  trainerType?: TrainerType;

  status?: TrainerStatus;

  includeDeleted: boolean;

  skip: number;

  take: number;
}

export interface TrainerListResponse {
  items: TrainerListItem[];

  count: number;
}

export interface CreateTrainerRequest {
  firstName: string;

  lastName?: string;
  profileImageFileId?: string;

  email?: string;

  phone?: string;

  gender?: TrainerGender;

  bio?: string;

  qualification?: string;

  experienceYears?: number;

  specialization?: string;

  skills?: string[];

  employeeCode?: string;

  trainerType?: TrainerType;

  linkedInUrl?: string;

  youtubeUrl?: string;

  instagramUrl?: string;

  branchId?: string;

  averageRating?: number;

  totalReviews?: number;

  isFeatured?: boolean;

  joinedAt?: string;

  courseIds?: string[];
}

export interface UpdateTrainerRequest {
  firstName?: string;
  profileImageFileId?: string;

  lastName?: string;

  email?: string;

  phone?: string;

  gender?: TrainerGender;

  bio?: string;

  qualification?: string;

  experienceYears?: number;

  specialization?: string;

  skills?: string[];

  employeeCode?: string;

  trainerType?: TrainerType;

  linkedInUrl?: string;

  youtubeUrl?: string;

  instagramUrl?: string;

  branchId?: string;

  averageRating?: number;

  totalReviews?: number;

  isFeatured?: boolean;

  joinedAt?: string;

  courseIds?: string[];
}

export interface ApiSuccessResponse<T> {
  success: true;

  message: string;

  data: T;
}

export interface ApiErrorResponse {
  success: false;

  code: string;

  message?: string;

  errors?: Record<
    string,
    string[]
  >;

  meta?: Record<
    string,
    string
  >;
}

export interface TrainerDeleteResponse {
  id: string;

  deleted: boolean;

  deletedAt: string;
}

export interface TrainerPermanentDeleteResponse {
  id: string;

  permanentlyDeleted: boolean;
}
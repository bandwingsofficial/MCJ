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
  | "INACTIVE"
  | "ARCHIVED";

export type TrainerDisplayStatus = TrainerStatus;

export type TrainerFilterStatus =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

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

  displayOrder?: number | null;

  joinedAt: string | null;

  courses: TrainerCourse[];

  createdBy: string;

  updatedBy: string | null;

  isDeleted: boolean;

  deletedAt: string | null;

  createdAt: string;

  updatedAt: string;
}

export interface TrainerListItem {
  id: string;

  firstName: string;

  lastName: string | null;

  email: string | null;

  phone: string | null;

  qualification: string | null;

  specialization: string | null;

  employeeCode: string | null;

  trainerType: TrainerType;

  profileImageUrl: string | null;

  branchId?: string | null;

  status: TrainerStatus;

  displayOrder?: number | null;

  deletedAt?: string | null;

  isDeleted?: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface TrainerDetails extends Trainer {}

export interface TrainerFilters {
  search?: string;

  /** Optional for non-trainers-page callers (e.g. branch manage). */
  branchId?: string;

  trainerType?: TrainerType;

  status?: TrainerFilterStatus;

  includeDeleted?: boolean;

  isDeleted?: boolean;

  page?: number;

  pageSize?: number;
}

export interface TrainerListResponse {
  items: TrainerListItem[];

  count: number;

  meta?: {
    total: number;
    skip: number;
    take: number;
  };
}

export interface CreateTrainerRequest {
  firstName: string;

  lastName?: string;

  profileImageFileId?: string | null;

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

  isFeatured?: boolean;

  joinedAt?: string;
}

export interface UpdateTrainerRequest {
  firstName?: string;

  profileImageFileId?: string | null;

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

  branchId?: string | null;

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

  errors?: Record<string, string[]>;

  meta?: Record<string, string>;
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

export interface SuggestTrainerCodeResponse {
  employeeCode: string;
}

export interface BulkTrainerItemResult {
  trainerId: string;
  success: boolean;
  message: string;
  status?: TrainerStatus;
}

export interface BulkTrainerOperationResult {
  requestedCount: number;
  processedCount: number;
  successCount: number;
  failedCount: number;
  results: BulkTrainerItemResult[];
  failures: BulkTrainerItemResult[];
}

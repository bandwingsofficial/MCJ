import { Placement } from '../entities/placement.entity';
import { PlacementStatus } from '../enums/placement-status.enum';

export interface PlacementJobView {
  id: string;
  title: string;
  slug: string;
  companyName: string;
}

export interface PlacementUserProfileView {
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
}

export interface PlacementUserView {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  profile: PlacementUserProfileView | null;
}

export interface PlacementDetailView {
  id: string;
  jobId: string;
  applicationId: string;
  userId: string;
  companyName: string;
  designation: string | null;
  salary: number | null;
  joiningDate: Date | null;
  remarks: string | null;
  status: PlacementStatus;
  job: PlacementJobView;
  user: PlacementUserView;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlacementListFilters {
  jobId?: string;
  userId?: string;
  status?: PlacementStatus;
  search?: string;
  skip?: number;
  take?: number;
}

export interface PlacementRepository {
  save(placement: Placement): Promise<void>;
  findById(id: string): Promise<Placement | null>;
  findDetailById(id: string): Promise<PlacementDetailView | null>;
  findDetailByApplicationId(
    applicationId: string,
  ): Promise<PlacementDetailView | null>;
  findDetailByUserId(
    userId: string,
  ): Promise<PlacementDetailView | null>;
  findDetails(filters?: PlacementListFilters): Promise<PlacementDetailView[]>;
  existsByApplicationId(applicationId: string): Promise<boolean>;
}

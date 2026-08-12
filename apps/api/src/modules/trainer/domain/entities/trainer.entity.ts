import { Bio } from '../value-objects/bio.vo';
import { Email } from '../value-objects/email.vo';
import { EmployeeCode } from '../value-objects/employee-code.vo';
import { Phone } from '../value-objects/phone.vo';
import { TrainerName } from '../value-objects/trainer-name.vo';
import { TrainerGender } from '../enums/trainer-gender.enum';
import { TrainerStatus } from '../enums/trainer-status.enum';
import { TrainerType } from '../enums/trainer-type.enum';
import { TrainerCourse } from './trainer-course.entity';

export class Trainer {
  private constructor(
    public readonly id: string,
    public firstName: TrainerName,
    public lastName: TrainerName | null,
    public email: Email,
    public phone: Phone,
    public gender: TrainerGender | null,
    public bio: Bio,
    public qualification: string | null,
    public experienceYears: number | null,
    public specialization: string | null,
    public skills: string[],
    public profileImageFileId: string | null,
    public profileImageUrl: string | null,
    public employeeCode: EmployeeCode,
    public trainerType: TrainerType,
    public linkedInUrl: string | null,
    public youtubeUrl: string | null,
    public instagramUrl: string | null,
public branch: {
  id: string;
  branchName: string;
  branchCode: string;
} | null,
public branchId: string | null,
public averageRating: number,
    public totalReviews: number,
    public isFeatured: boolean,
    public status: TrainerStatus,
    public joinedAt: Date | null,
    public courses: TrainerCourse[],
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: TrainerCreateParams): Trainer {
    return new Trainer(
      params.id,
      TrainerName.create(params.firstName),
      params.lastName ? TrainerName.create(params.lastName) : null,
      Email.create(params.email),
      Phone.create(params.phone),
      params.gender ?? null,
      Bio.create(params.bio),
      params.qualification ?? null,
      params.experienceYears ?? null,
      params.specialization ?? null,
      params.skills ?? [],
      params.profileImageFileId ?? null,
      params.profileImageUrl ?? null,
      EmployeeCode.create(params.employeeCode),
      params.trainerType ?? TrainerType.FULL_TIME,
      params.linkedInUrl ?? null,
      params.youtubeUrl ?? null,
      params.instagramUrl ?? null,
      params.branch ?? null,
      params.branchId ?? null,
      params.averageRating ?? 0,
      params.totalReviews ?? 0,
      params.isFeatured ?? false,
      params.status ?? TrainerStatus.ACTIVE,
      params.joinedAt ?? null,
      params.courses ?? [],
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: TrainerReconstituteParams): Trainer {
    return new Trainer(
      params.id,
      TrainerName.create(params.firstName),
      params.lastName ? TrainerName.create(params.lastName) : null,
      Email.create(params.email),
      Phone.create(params.phone),
      params.gender,
      Bio.create(params.bio),
      params.qualification,
      params.experienceYears,
      params.specialization,
      params.skills,
      params.profileImageFileId,
      params.profileImageUrl,
      EmployeeCode.create(params.employeeCode),
      params.trainerType,
      params.linkedInUrl,
      params.youtubeUrl,
      params.instagramUrl,
      params.branch,
      params.branchId,
      params.averageRating,
      params.totalReviews,
      params.isFeatured,
      params.status,
      params.joinedAt,
      params.courses,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: TrainerUpdateParams) {
    if (params.firstName !== undefined) this.firstName = TrainerName.create(params.firstName);
    if (params.lastName !== undefined) this.lastName = params.lastName ? TrainerName.create(params.lastName) : null;
    if (params.email !== undefined) this.email = Email.create(params.email);
    if (params.phone !== undefined) this.phone = Phone.create(params.phone);
    if (params.gender !== undefined) this.gender = params.gender;
    if (params.bio !== undefined) this.bio = Bio.create(params.bio);
    if (params.qualification !== undefined) this.qualification = params.qualification;
    if (params.experienceYears !== undefined) this.experienceYears = params.experienceYears;
    if (params.specialization !== undefined) this.specialization = params.specialization;
    if (params.skills !== undefined) this.skills = params.skills;
    if (params.profileImageFileId !== undefined) this.profileImageFileId = params.profileImageFileId;
    if (params.profileImageUrl !== undefined) this.profileImageUrl = params.profileImageUrl;
    if (params.employeeCode !== undefined) this.employeeCode = EmployeeCode.create(params.employeeCode);
    if (params.trainerType !== undefined) this.trainerType = params.trainerType;
    if (params.linkedInUrl !== undefined) this.linkedInUrl = params.linkedInUrl;
    if (params.youtubeUrl !== undefined) this.youtubeUrl = params.youtubeUrl;
    if (params.instagramUrl !== undefined) this.instagramUrl = params.instagramUrl;
    if (params.branch !== undefined)
  this.branch = params.branch;
    if (params.branchId !== undefined) this.branchId = params.branchId;
    if (params.averageRating !== undefined) this.averageRating = params.averageRating;
    if (params.totalReviews !== undefined) this.totalReviews = params.totalReviews;
    if (params.isFeatured !== undefined) this.isFeatured = params.isFeatured;
    if (params.joinedAt !== undefined) this.joinedAt = params.joinedAt;
    if (params.courses !== undefined) this.courses = params.courses;

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.status = TrainerStatus.ACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.status = TrainerStatus.INACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.status = TrainerStatus.ARCHIVED;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.status = TrainerStatus.ACTIVE;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface TrainerCreateParams {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: TrainerGender | null;
  bio?: string | null;
  qualification?: string | null;
  experienceYears?: number | null;
  specialization?: string | null;
  skills?: string[];
  profileImageFileId?: string | null;
  profileImageUrl?: string | null;
  employeeCode?: string | null;
  trainerType?: TrainerType;
  linkedInUrl?: string | null;
  youtubeUrl?: string | null;
  instagramUrl?: string | null;
  branch?: {
  id: string;
  branchName: string;
  branchCode: string;
} | null;
  branchId?: string | null;
  averageRating?: number;
  totalReviews?: number;
  isFeatured?: boolean;
  status?: TrainerStatus;
  joinedAt?: Date | null;
  courses?: TrainerCourse[];
  createdBy?: string | null;
}

export interface TrainerUpdateParams
  extends Partial<Omit<TrainerCreateParams, 'id' | 'createdBy'>> {
  updatedBy?: string | null;
}

export interface TrainerReconstituteParams
  extends Required<
    Omit<
      TrainerCreateParams,
      | 'lastName'
      | 'email'
      | 'phone'
      | 'gender'
      | 'bio'
      | 'qualification'
      | 'experienceYears'
      | 'specialization'
      | 'profileImageFileId'
      | 'profileImageUrl'
      | 'employeeCode'
      | 'linkedInUrl'
      | 'youtubeUrl'
      | 'instagramUrl'
      | 'branchId'
      | 'joinedAt'
    >
  > {
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: TrainerGender | null;
  bio: string | null;
  qualification: string | null;
  experienceYears: number | null;
  specialization: string | null;
  profileImageFileId: string | null;
  profileImageUrl: string | null;
  employeeCode: string | null;
  linkedInUrl: string | null;
  youtubeUrl: string | null;
  instagramUrl: string | null;
  branch: {
  id: string;
  branchName: string;
  branchCode: string;
} | null;
  branchId: string | null;
  joinedAt: Date | null;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

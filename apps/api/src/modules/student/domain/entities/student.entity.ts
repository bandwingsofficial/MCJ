import { Address } from '../value-objects/address.vo';
import { Email } from '../value-objects/email.vo';
import { Phone } from '../value-objects/phone.vo';
import { Qualification } from '../value-objects/qualification.vo';
import { StudentCode } from '../value-objects/student-code.vo';
import { StudentName } from '../value-objects/student-name.vo';
import { StudentGender } from '../enums/student-gender.enum';
import { StudentStatus } from '../enums/student-status.enum';

export class Student {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public firstName: StudentName,
    public lastName: StudentName | null,
    public email: Email,
    public phone: Phone,
    public gender: StudentGender | null,
    public dateOfBirth: Date | null,
    public address: Address,
    public profileImageFileId: string | null,
    public profileImageUrl: string | null,
    public qualification: Qualification,
    public collegeName: string | null,
    public specialization: string | null,
    public passingYear: number | null,
    public parentName: StudentName | null,
    public parentPhone: Phone,
    public emergencyContactName: StudentName | null,
    public emergencyContactPhone: Phone,
    public studentCode: StudentCode,
    public admissionDate: Date | null,
    public branchId: string,
    public notes: string | null,
    public isActive: boolean,
    public status: StudentStatus,    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: StudentCreateParams): Student {
    return new Student(
      params.id,
      params.userId,
      StudentName.create(params.firstName),
      params.lastName ? StudentName.create(params.lastName) : null,
      Email.create(params.email),
      Phone.create(params.phone),
      params.gender ?? null,
      params.dateOfBirth ?? null,
      Address.create(params),
      params.profileImageFileId ?? null,
      params.profileImageUrl ?? null,
      Qualification.create(params.qualification),
      params.collegeName ?? null,
      params.specialization ?? null,
      params.passingYear ?? null,
      params.parentName ? StudentName.create(params.parentName) : null,
      Phone.create(params.parentPhone),
      params.emergencyContactName
        ? StudentName.create(params.emergencyContactName)
        : null,
      Phone.create(params.emergencyContactPhone),
      StudentCode.create(params.studentCode),
      params.admissionDate ?? null,
      params.branchId,
      sanitizeText(params.notes, 4000),
      params.isActive ?? true,
      params.status ?? StudentStatus.LEAD,      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(params: StudentReconstituteParams): Student {
    return new Student(
      params.id,
      params.userId,
      StudentName.create(params.firstName),
      params.lastName ? StudentName.create(params.lastName) : null,
      Email.create(params.email),
      Phone.create(params.phone),
      params.gender,
      params.dateOfBirth,
      Address.create(params),
      params.profileImageFileId,
      params.profileImageUrl,
      Qualification.create(params.qualification),
      params.collegeName,
      params.specialization,
      params.passingYear,
      params.parentName ? StudentName.create(params.parentName) : null,
      Phone.create(params.parentPhone),
      params.emergencyContactName
        ? StudentName.create(params.emergencyContactName)
        : null,
      Phone.create(params.emergencyContactPhone),
      StudentCode.create(params.studentCode),
      params.admissionDate,
      params.branchId,
      sanitizeText(params.notes, 4000),
      params.isActive,
      params.status,      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: StudentUpdateParams) {
    if (params.firstName !== undefined) this.firstName = StudentName.create(params.firstName);
    if (params.lastName !== undefined) this.lastName = params.lastName ? StudentName.create(params.lastName) : null;
    if (params.email !== undefined) this.email = Email.create(params.email);
    if (params.phone !== undefined) this.phone = Phone.create(params.phone);
    if (params.gender !== undefined) this.gender = params.gender;
    if (params.dateOfBirth !== undefined) this.dateOfBirth = params.dateOfBirth;
    if (hasAddressChange(params)) this.address = Address.create({ ...this.address, ...params });
    if (params.profileImageFileId !== undefined) this.profileImageFileId = params.profileImageFileId;
    if (params.profileImageUrl !== undefined) this.profileImageUrl = params.profileImageUrl;
    if (params.qualification !== undefined) this.qualification = Qualification.create(params.qualification);
    if (params.collegeName !== undefined) this.collegeName = params.collegeName;
    if (params.specialization !== undefined) this.specialization = params.specialization;
    if (params.passingYear !== undefined) this.passingYear = params.passingYear;
    if (params.parentName !== undefined) this.parentName = params.parentName ? StudentName.create(params.parentName) : null;
    if (params.parentPhone !== undefined) this.parentPhone = Phone.create(params.parentPhone);
    if (params.emergencyContactName !== undefined) this.emergencyContactName = params.emergencyContactName ? StudentName.create(params.emergencyContactName) : null;
    if (params.emergencyContactPhone !== undefined) this.emergencyContactPhone = Phone.create(params.emergencyContactPhone);
    if (params.studentCode !== undefined) this.studentCode = StudentCode.create(params.studentCode);
    if (params.admissionDate !== undefined) this.admissionDate = params.admissionDate;
    if (params.branchId !== undefined) this.branchId = params.branchId;
    if (params.notes !== undefined) this.notes = sanitizeText(params.notes, 4000);
    if (params.status !== undefined) this.status = params.status;

    this.updatedBy = params.updatedBy ?? this.updatedBy;    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.isActive = false;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }
  private touch() {
    this.updatedAt = new Date();
  }
}

export interface StudentCreateParams {
  id: string;
  firstName: string;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  gender?: StudentGender | null;
  dateOfBirth?: Date | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  profileImageFileId?: string | null;
  profileImageUrl?: string | null;
  qualification?: string | null;
  collegeName?: string | null;
  specialization?: string | null;
  passingYear?: number | null;
  parentName?: string | null;
  parentPhone?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  studentCode: string;
  userId: string;
  admissionDate?: Date | null;
  branchId: string;
  notes?: string | null;
  isActive?: boolean;
  status?: StudentStatus;  createdBy?: string | null;
}

export interface StudentUpdateParams
  extends Partial<Omit<StudentCreateParams, 'id' | 'createdBy'>> {
  updatedBy?: string | null;
}
export interface StudentReconstituteParams
  extends Required<
    Omit<
      StudentCreateParams,
      | 'lastName'
      | 'email'
      | 'phone'
      | 'gender'
      | 'dateOfBirth'
      | 'addressLine1'
      | 'addressLine2'
      | 'city'
      | 'state'
      | 'country'
      | 'postalCode'
      | 'profileImageFileId'
      | 'profileImageUrl'
      | 'qualification'
      | 'collegeName'
      | 'specialization'
      | 'passingYear'
      | 'parentName'
      | 'parentPhone'
      | 'emergencyContactName'
      | 'emergencyContactPhone'
      | 'admissionDate'
      | 'notes'
    >
  > {
  lastName: string | null;
  email: string | null;
  phone: string | null;
  gender: StudentGender | null;
  dateOfBirth: Date | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  profileImageFileId: string | null;
  profileImageUrl: string | null;
  qualification: string | null;
  collegeName: string | null;
  specialization: string | null;
  passingYear: number | null;
  parentName: string | null;
  parentPhone: string | null;
  emergencyContactName: string | null;
  emergencyContactPhone: string | null;
  admissionDate: Date | null;
  notes: string | null;
  userId: string;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const sanitizeText = (
  value?: string | null,
  maxLength = 1000,
) => {
  const normalized = value?.trim() || null;
  return normalized ? normalized.slice(0, maxLength) : null;
};

const hasAddressChange = (params: StudentUpdateParams) =>
  params.addressLine1 !== undefined ||
  params.addressLine2 !== undefined ||
  params.city !== undefined ||
  params.state !== undefined ||
  params.country !== undefined ||
  params.postalCode !== undefined;

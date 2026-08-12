import type { Profile } from '@modules/profile/domain/entities/profile.entity';
import { Gender } from '@modules/profile/domain/enums/gender.enum';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import type { StudentUpdateParams } from '../../domain/entities/student.entity';
import { StudentGender } from '../../domain/enums/student-gender.enum';

export interface StudentPersonalFields {
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
  profileImageUrl?: string | null;
}

export const toStudentGender = (
  gender: Gender | null | undefined,
): StudentGender | null => {
  if (!gender) {
    return null;
  }

  return gender as unknown as StudentGender;
};

export const toProfileGender = (
  gender?: StudentGender,
): Gender | undefined => {
  if (!gender) {
    return undefined;
  }

  return gender as unknown as Gender;
};

export const extractPersonalFieldsFromProfile = (
  profile: Profile,
): StudentPersonalFields => {
  const firstName = profile.firstName?.getValue()?.trim();

  if (!firstName) {
    throw new BaseException(
      ERROR_CODES.VALIDATION_ERROR,
      'Profile first name is required to create a student record',
      400,
    );
  }

  return {
    firstName,
    lastName: profile.lastName?.getValue() ?? null,
    email: profile.email,
    phone: profile.phone,
    gender: toStudentGender(profile.gender),
    dateOfBirth: profile.dob?.getValue() ?? null,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    postalCode: profile.postalCode?.getValue() ?? null,
    profileImageUrl: profile.profileImage?.getValue() ?? null,
  };
};

export const mapProfileToStudentSyncUpdate = (
  profile: Profile,
  updatedBy: string,
): StudentUpdateParams => {
  const params: StudentUpdateParams = {
    lastName: profile.lastName?.getValue() ?? null,
    email: profile.email,
    phone: profile.phone,
    gender: toStudentGender(profile.gender),
    dateOfBirth: profile.dob?.getValue() ?? null,
    addressLine1: profile.addressLine1,
    addressLine2: profile.addressLine2,
    city: profile.city,
    state: profile.state,
    country: profile.country,
    postalCode: profile.postalCode?.getValue() ?? null,
    profileImageUrl: profile.profileImage?.getValue() ?? null,
    updatedBy,
  };

  const firstName = profile.firstName?.getValue()?.trim();

  if (firstName) {
    params.firstName = firstName;
  }

  return params;
};

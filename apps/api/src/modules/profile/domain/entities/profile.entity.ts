// src/modules/profile/domain/entities/profile.entity.ts

import { Gender } from '../enums/gender.enum';

import { FirstName } from '../value-objects/first-name.vo';
import { LastName } from '../value-objects/last-name.vo';
import { Bio } from '../value-objects/bio.vo';
import { ProfileImage } from '../value-objects/profile-image.vo';
import { DateOfBirth } from '../value-objects/date-of-birth.vo';
import { PostalCode } from '../value-objects/postal-code.vo';

export class Profile {
  private constructor(
    public readonly id: string,

    public readonly userId: string,

    public firstName: FirstName | null,
    public lastName: LastName | null,

    public email: string | null,
    public phone: string | null,

    public gender: Gender | null,

    public dob: DateOfBirth | null,

    public profileImage: ProfileImage | null,

    public addressLine1: string | null,
    public addressLine2: string | null,

    public city: string | null,
    public state: string | null,
    public country: string | null,

    public postalCode: PostalCode | null,

    public bio: Bio | null,

    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  // =====================
  // 🟢 FACTORY
  // =====================

  static create(params: {
    id: string;
    userId: string;

    firstName?: string;
    lastName?: string;

    email?: string;
    phone?: string;

    gender?: Gender;

    dob?: Date;

    profileImage?: string;

    addressLine1?: string;
    addressLine2?: string;

    city?: string;
    state?: string;
    country?: string;

    postalCode?: string;

    bio?: string;
  }): Profile {
    return new Profile(
      params.id,
      params.userId,

      params.firstName
        ? FirstName.create(params.firstName)
        : null,

      params.lastName
        ? LastName.create(params.lastName)
        : null,

      params.email?.trim().toLowerCase() ?? null,
      params.phone?.replace(/[\s-]/g, '').trim() ?? null,

      params.gender ?? null,

      params.dob
        ? DateOfBirth.create(params.dob)
        : null,

      params.profileImage
        ? ProfileImage.create(params.profileImage)
        : null,

      params.addressLine1?.trim() ?? null,
      params.addressLine2?.trim() ?? null,

      params.city?.trim() ?? null,
      params.state?.trim() ?? null,
      params.country?.trim() ?? null,

      params.postalCode
        ? PostalCode.create(params.postalCode)
        : null,

      params.bio
        ? Bio.create(params.bio)
        : null,

      new Date(),
      new Date(),
    );
  }

  // =====================
  // 🔵 RECONSTITUTE
  // =====================

  static reconstitute(params: {
    id: string;

    userId: string;

    firstName: string | null;
    lastName: string | null;

    email: string | null;
    phone: string | null;

    gender: Gender | null;

    dob: Date | null;

    profileImage: string | null;

    addressLine1: string | null;
    addressLine2: string | null;

    city: string | null;
    state: string | null;
    country: string | null;

    postalCode: string | null;

    bio: string | null;

    createdAt: Date;
    updatedAt: Date;
  }): Profile {
    return new Profile(
      params.id,
      params.userId,

      params.firstName
        ? FirstName.create(params.firstName)
        : null,

      params.lastName
        ? LastName.create(params.lastName)
        : null,

      params.email,
      params.phone,

      params.gender,

      params.dob
        ? DateOfBirth.create(params.dob)
        : null,

      params.profileImage
        ? ProfileImage.create(params.profileImage)
        : null,

      params.addressLine1,
      params.addressLine2,

      params.city,
      params.state,
      params.country,

      params.postalCode
        ? PostalCode.create(params.postalCode)
        : null,

      params.bio
        ? Bio.create(params.bio)
        : null,

      params.createdAt,
      params.updatedAt,
    );
  }

  // =====================
  // 🧠 PROFILE BEHAVIOR
  // =====================

  changeFirstName(firstName: string | null) {
    this.firstName = firstName
      ? FirstName.create(firstName)
      : null;

    this.touch();
  }

  changeLastName(lastName: string | null) {
    this.lastName = lastName
      ? LastName.create(lastName)
      : null;

    this.touch();
  }

  changeEmail(email: string | null) {
    this.email = email?.trim().toLowerCase() ?? null;
    this.touch();
  }

  changePhone(phone: string | null) {
    this.phone = phone?.replace(/[\s-]/g, '').trim() ?? null;
    this.touch();
  }

  changeGender(gender: Gender | null) {
    this.gender = gender;
    this.touch();
  }

  changeDob(dob: Date | null) {
    this.dob = dob
      ? DateOfBirth.create(dob)
      : null;

    this.touch();
  }

  changeProfileImage(image: string | null) {
    this.profileImage = image
      ? ProfileImage.create(image)
      : null;

    this.touch();
  }

  changeBio(bio: string | null) {
    this.bio = bio
      ? Bio.create(bio)
      : null;

    this.touch();
  }

  updateAddress(params: {
  addressLine1?: string | null;
  addressLine2?: string | null;

  city?: string | null;
  state?: string | null;
  country?: string | null;

  postalCode?: string | null;
}) {
  // ✅ update only if field provided

  if (params.addressLine1 !== undefined) {
    this.addressLine1 =
      params.addressLine1?.trim() ?? null;
  }

  if (params.addressLine2 !== undefined) {
    this.addressLine2 =
      params.addressLine2?.trim() ?? null;
  }

  if (params.city !== undefined) {
    this.city =
      params.city?.trim() ?? null;
  }

  if (params.state !== undefined) {
    this.state =
      params.state?.trim() ?? null;
  }

  if (params.country !== undefined) {
    this.country =
      params.country?.trim() ?? null;
  }

  if (params.postalCode !== undefined) {
    this.postalCode = params.postalCode
      ? PostalCode.create(
          params.postalCode,
        )
      : null;
  }

  this.touch();
}

  // =====================
  // 🧠 BUSINESS RULES
  // =====================

  hasCompleteName(): boolean {
    return !!this.firstName && !!this.lastName;
  }

  hasProfileImage(): boolean {
    return !!this.profileImage;
  }

  isAdult(): boolean {
    if (!this.dob) return false;

    const today = new Date();

    const age =
      today.getFullYear() -
      this.dob.getValue().getFullYear();

    return age >= 18;
  }

  // =====================
  // 🛠️ INTERNAL
  // =====================

  private touch() {
    this.updatedAt = new Date();
  }
}
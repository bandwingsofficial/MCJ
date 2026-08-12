import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

export interface AddressParams {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
}

export class Address {
  private constructor(
    public readonly addressLine1: string | null,
    public readonly addressLine2: string | null,
    public readonly city: string | null,
    public readonly state: string | null,
    public readonly country: string | null,
    public readonly postalCode: string | null,
  ) {}

  static create(params: AddressParams = {}): Address {
    const address = {
      addressLine1: normalize(params.addressLine1),
      addressLine2: normalize(params.addressLine2),
      city: normalize(params.city),
      state: normalize(params.state),
      country: normalize(params.country),
      postalCode: normalize(params.postalCode),
    };

    for (const [field, value] of Object.entries(address)) {
      if (value && value.length > 160) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          `Student ${field} must be less than 160 characters`,
          400,
        );
      }
    }

    return new Address(
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    );
  }
}

const normalize = (value?: string | null) =>
  value?.trim() || null;

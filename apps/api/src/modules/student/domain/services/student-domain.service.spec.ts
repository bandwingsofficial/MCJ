import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { StudentDomainService } from './student-domain.service';
import type { StudentRepository } from '../repositories/student.repository';

describe('StudentDomainService uniqueness', () => {
  const service = new StudentDomainService();

  it('throws STUDENT_EMAIL_EXISTS with field meta', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue({ id: 'existing' }),
    } as unknown as StudentRepository;

    await expect(
      service.ensureEmailIsAvailable(repo, 'akshay@example.com'),
    ).rejects.toMatchObject({
      code: ERROR_CODES.STUDENT_EMAIL_EXISTS,
      statusCode: 409,
      metadata: { field: 'email' },
    });

    await expect(
      service.ensureEmailIsAvailable(repo, 'akshay@example.com'),
    ).rejects.toBeInstanceOf(BaseException);
  });

  it('throws STUDENT_PHONE_EXISTS with field meta', async () => {
    const repo = {
      findByPhone: jest.fn().mockResolvedValue({ id: 'existing' }),
    } as unknown as StudentRepository;

    await expect(
      service.ensurePhoneIsAvailable(repo, '9876543210'),
    ).rejects.toMatchObject({
      code: ERROR_CODES.STUDENT_PHONE_EXISTS,
      statusCode: 409,
      metadata: { field: 'phone' },
    });
  });

  it('allows available email and phone', async () => {
    const repo = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
    } as unknown as StudentRepository;

    await expect(
      service.ensureEmailIsAvailable(repo, 'new@example.com'),
    ).resolves.toBeUndefined();
    await expect(
      service.ensurePhoneIsAvailable(repo, '9999999999'),
    ).resolves.toBeUndefined();
  });
});

CREATE TYPE "PasswordResetChannel" AS ENUM ('LINK', 'OTP');

ALTER TABLE "PasswordResetToken"
ADD COLUMN "channel" "PasswordResetChannel" NOT NULL DEFAULT 'LINK',
ADD COLUMN "authorizedAt" TIMESTAMP(3);

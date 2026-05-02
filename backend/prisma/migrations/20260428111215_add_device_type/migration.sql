-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET', 'UNKNOWN');

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN';

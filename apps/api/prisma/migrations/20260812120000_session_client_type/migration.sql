-- Add ClientType for multi-platform session listing (web + mobile)

CREATE TYPE "ClientType" AS ENUM ('WEB', 'IOS', 'ANDROID', 'ADMIN_WEB', 'UNKNOWN');

ALTER TABLE "Session"
ADD COLUMN "clientType" "ClientType" NOT NULL DEFAULT 'UNKNOWN';

CREATE INDEX "Session_clientType_idx" ON "Session"("clientType");

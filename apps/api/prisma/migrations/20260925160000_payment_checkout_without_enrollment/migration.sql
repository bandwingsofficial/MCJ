-- Allow Razorpay checkout before enrollment exists (payment-first public enroll).

ALTER TABLE "Payment"
  ALTER COLUMN "enrollmentId" DROP NOT NULL;

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "checkoutPayload" JSONB;

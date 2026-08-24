-- Rename discountPrice to discountAmount and add discountedPrice with data migration.

ALTER TABLE "Course" ADD COLUMN "discountedPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Course" ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;

UPDATE "Course"
SET
  "discountedPrice" = CASE
    WHEN "isFree" = true THEN 0
    WHEN "discountPrice" <= 0 THEN "originalPrice"
    WHEN "discountPrice" < "originalPrice"
      AND (("originalPrice" - "discountPrice") / NULLIF("originalPrice", 0)) * 100
        > ("discountPrice" / NULLIF("originalPrice", 0)) * 100
      AND ("discountPrice" / NULLIF("originalPrice", 0)) < 0.15
      THEN "discountPrice"
    ELSE GREATEST(0, "originalPrice" - "discountPrice")
  END,
  "discountAmount" = CASE
    WHEN "isFree" = true THEN 0
    WHEN "discountPrice" <= 0 THEN 0
    WHEN "discountPrice" < "originalPrice"
      AND (("originalPrice" - "discountPrice") / NULLIF("originalPrice", 0)) * 100
        > ("discountPrice" / NULLIF("originalPrice", 0)) * 100
      AND ("discountPrice" / NULLIF("originalPrice", 0)) < 0.15
      THEN "originalPrice" - "discountPrice"
    ELSE "discountPrice"
  END;

ALTER TABLE "Course" DROP COLUMN "discountPrice";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('STUDENT', 'ADMIN');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLOCKED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('REGISTER', 'LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'LOGOUT_ALL', 'REFRESH', 'SESSION_REVOKED', 'PASSWORD_RESET_REQUESTED', 'PASSWORD_RESET_SUCCESS', 'PASSWORD_RESET_FAILED', 'ADMIN_LOGIN', 'ADMIN_LOGIN_FAILED', 'MFA_SETUP', 'MFA_VERIFIED', 'MFA_FAILED', 'ADMIN_MFA_FAILED', 'ADMIN_MFA_SUCCESS');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'TABLET', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "BranchStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CLOSED', 'UNDER_MAINTENANCE');

-- CreateEnum
CREATE TYPE "BranchUserRole" AS ENUM ('BRANCH_MANAGER', 'RECEPTIONIST', 'ACCOUNTANT', 'FACULTY_COORDINATOR', 'COUNSELOR', 'STAFF');

-- CreateEnum
CREATE TYPE "Permission" AS ENUM ('BRANCH_USER_CREATE', 'BRANCH_USER_READ', 'BRANCH_USER_UPDATE', 'BRANCH_USER_DELETE', 'BRANCH_USER_ACTIVATE', 'BRANCH_USER_DEACTIVATE', 'BRANCH_USER_ASSIGN_ROLE', 'BRANCH_USER_ASSIGN_PERMISSION', 'STUDENT_CREATE', 'STUDENT_READ', 'STUDENT_UPDATE', 'STUDENT_DELETE', 'COURSE_CREATE', 'COURSE_READ', 'COURSE_UPDATE', 'COURSE_DELETE', 'PAYMENT_CREATE', 'PAYMENT_READ', 'PAYMENT_UPDATE', 'PAYMENT_DELETE', 'REPORT_READ');

-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "FileProvider" AS ENUM ('S3', 'LOCAL');

-- CreateEnum
CREATE TYPE "FileVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DurationType" AS ENUM ('DAYS', 'WEEKS', 'MONTHS', 'YEARS');

-- CreateEnum
CREATE TYPE "CourseMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "CourseLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "MaterialType" AS ENUM ('PDF', 'VIDEO', 'LINK', 'DOC');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('PDF', 'PPT', 'DOC', 'ZIP', 'IMAGE', 'VIDEO', 'LINK', 'CODE', 'OTHER');

-- CreateEnum
CREATE TYPE "TrainerStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TrainerType" AS ENUM ('FULL_TIME', 'PART_TIME', 'VISITING', 'GUEST', 'ONLINE');

-- CreateEnum
CREATE TYPE "BatchStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('LEAD', 'ENQUIRED', 'ADMITTED', 'COMPLETED', 'DROPPED', 'PLACED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'ADMITTED', 'ACTIVE', 'COMPLETED', 'DROPPED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PARTIAL', 'PAID');

-- CreateEnum
CREATE TYPE "EnrollmentSource" AS ENUM ('ADMIN', 'PUBLIC');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE', 'RAZORPAY');

-- CreateEnum
CREATE TYPE "PaymentTransactionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentGateway" AS ENUM ('MANUAL', 'RAZORPAY');

-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');

-- CreateEnum
CREATE TYPE "WorkingDays" AS ENUM ('ONE_DAY', 'TWO_DAYS', 'THREE_DAYS', 'FOUR_DAYS', 'FIVE_DAYS', 'SIX_DAYS', 'MONDAY_TO_FRIDAY', 'MONDAY_TO_SATURDAY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "JobApplicationStatus" AS ENUM ('APPLIED', 'SHORTLISTED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED', 'REJECTED', 'PLACED');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('PENDING', 'JOINED', 'NOT_JOINED');

-- CreateEnum
CREATE TYPE "FinancialArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommunityPostType" AS ENUM ('IMAGE', 'VIDEO');

-- CreateEnum
CREATE TYPE "CommunityPostStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "tokenVersion" INTEGER NOT NULL DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "lastPasswordChangeAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
    "mfaSecret" TEXT,
    "mfaVerifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "fingerprint" TEXT,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "requestedFromIp" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "deviceType" "DeviceType" NOT NULL DEFAULT 'UNKNOWN',
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "sessionId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "gender" "Gender",
    "dob" TIMESTAMP(3),
    "profileImage" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT,
    "phone" TEXT,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Branch" (
    "id" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "branchCode" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "BranchStatus" NOT NULL DEFAULT 'ACTIVE',
    "description" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BranchUser" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password" TEXT NOT NULL,
    "role" "BranchUserRole" NOT NULL DEFAULT 'STAFF',
    "permissions" "Permission"[] DEFAULT ARRAY[]::"Permission"[],
    "branchId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "refreshToken" TEXT,
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BranchUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "extension" TEXT,
    "size" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "cdnUrl" TEXT,
    "provider" "FileProvider" NOT NULL DEFAULT 'S3',
    "visibility" "FileVisibility" NOT NULL DEFAULT 'PUBLIC',
    "uploadedBy" TEXT,
    "branchId" TEXT,
    "metadata" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "thumbnailFileId" TEXT,
    "thumbnailUrl" TEXT,
    "status" "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    "displayOrder" INTEGER,
    "branchId" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tagline" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "thumbnailFileId" TEXT,
    "thumbnailUrl" TEXT,
    "originalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountPrice" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "duration" INTEGER,
    "durationType" "DurationType",
    "level" "CourseLevel" NOT NULL DEFAULT 'BEGINNER',
    "mode" "CourseMode"[],
    "language" TEXT NOT NULL DEFAULT 'English',
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "categoryId" TEXT NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseBranch" (
    "courseId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,

    CONSTRAINT "CourseBranch_pkey" PRIMARY KEY ("courseId","branchId")
);

-- CreateTable
CREATE TABLE "CourseImage" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseMaterial" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MaterialType" NOT NULL,
    "fileId" TEXT,
    "externalUrl" TEXT,
    "displayOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseModule" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "keySkills" TEXT[],
    "thumbnailUrl" TEXT,
    "duration" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseLesson" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "videoUrl" TEXT,
    "duration" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseResource" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL DEFAULT 'OTHER',
    "fileUrl" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseResource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trainer" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gender" "Gender",
    "bio" TEXT,
    "qualification" TEXT,
    "experienceYears" INTEGER,
    "specialization" TEXT,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "profileImageFileId" TEXT,
    "profileImageUrl" TEXT,
    "employeeCode" TEXT,
    "trainerType" "TrainerType" NOT NULL DEFAULT 'FULL_TIME',
    "linkedInUrl" TEXT,
    "youtubeUrl" TEXT,
    "instagramUrl" TEXT,
    "branchId" TEXT,
    "averageRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalReviews" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "TrainerStatus" NOT NULL DEFAULT 'ACTIVE',
    "joinedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainerCourse" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Batch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "branchId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "daysOfWeek" "DayOfWeek"[] DEFAULT ARRAY[]::"DayOfWeek"[],
    "capacity" INTEGER NOT NULL,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "mode" "CourseMode" NOT NULL DEFAULT 'OFFLINE',
    "classroom" TEXT,
    "meetingLink" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Batch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BatchTrainer" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchTrainer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "gender" "Gender",
    "dateOfBirth" TIMESTAMP(3),
    "addressLine1" TEXT,
    "addressLine2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "postalCode" TEXT,
    "profileImageFileId" TEXT,
    "profileImageUrl" TEXT,
    "qualification" TEXT,
    "collegeName" TEXT,
    "specialization" TEXT,
    "passingYear" INTEGER,
    "parentName" TEXT,
    "parentPhone" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "studentCode" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3),
    "branchId" TEXT NOT NULL,
    "notes" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'LEAD',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enrollment" (
    "id" TEXT NOT NULL,
    "enrollmentNumber" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "admissionDate" TIMESTAMP(3),
    "joiningDate" TIMESTAMP(3),
    "expectedCompletionDate" TIMESTAMP(3),
    "feeAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "finalAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'PENDING',
    "source" "EnrollmentSource" NOT NULL DEFAULT 'ADMIN',
    "remarks" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentNumber" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "paymentMethod" "PaymentMethod" NOT NULL,
    "paymentStatus" "PaymentTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "gateway" "PaymentGateway" NOT NULL DEFAULT 'MANUAL',
    "gatewayOrderId" TEXT,
    "gatewayPaymentId" TEXT,
    "gatewaySignature" TEXT,
    "transactionId" TEXT,
    "remarks" TEXT,
    "paidAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyLogo" TEXT,
    "companyWebsite" TEXT,
    "companyDescription" TEXT,
    "description" TEXT,
    "shortDescription" TEXT,
    "location" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "isRemote" BOOLEAN NOT NULL DEFAULT false,
    "employmentType" "EmploymentType" NOT NULL,
    "workingDays" "WorkingDays" NOT NULL,
    "minExperience" INTEGER,
    "maxExperience" INTEGER,
    "minSalary" DECIMAL(12,2),
    "maxSalary" DECIMAL(12,2),
    "salaryCurrency" TEXT NOT NULL DEFAULT 'INR',
    "vacancies" INTEGER NOT NULL DEFAULT 1,
    "applicationDeadline" TIMESTAMP(3),
    "responsibilities" TEXT[],
    "skills" TEXT[],
    "eligibilityTitle" TEXT,
    "interviewProcess" JSONB,
    "status" "JobStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobApplication" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "resumeFileId" TEXT,
    "coverLetter" TEXT,
    "currentLocation" TEXT,
    "expectedSalary" DECIMAL(12,2),
    "remarks" TEXT,
    "status" "JobApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "designation" TEXT,
    "salary" DECIMAL(12,2),
    "joiningDate" TIMESTAMP(3),
    "remarks" TEXT,
    "status" "PlacementStatus" NOT NULL DEFAULT 'PENDING',
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortDescription" TEXT,
    "content" TEXT,
    "thumbnailFileId" TEXT,
    "thumbnailUrl" TEXT,
    "bannerFileId" TEXT,
    "bannerUrl" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'MCJ Team',
    "authorImage" TEXT,
    "tags" TEXT[],
    "categoryId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "status" "FinancialArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" TIMESTAMP(3),
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPost" (
    "id" TEXT NOT NULL,
    "type" "CommunityPostType" NOT NULL,
    "caption" TEXT,
    "mediaFileId" TEXT,
    "mediaUrl" TEXT,
    "thumbnailUrl" TEXT,
    "hashtags" TEXT[],
    "mentions" TEXT[],
    "location" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "status" "CommunityPostStatus" NOT NULL DEFAULT 'DRAFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPostLike" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityPostLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityPostComment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "parentId" TEXT,
    "content" TEXT NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CommunityPostComment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_phone_idx" ON "User"("phone");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_deletedAt_idx" ON "User"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Session_refreshTokenHash_key" ON "Session"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_userId_isRevoked_idx" ON "Session"("userId", "isRevoked");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Session_lastUsedAt_idx" ON "Session"("lastUsedAt");

-- CreateIndex
CREATE INDEX "Session_createdAt_idx" ON "Session"("createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expiresAt_idx" ON "PasswordResetToken"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_createdAt_idx" ON "PasswordResetToken"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "PasswordResetToken_isUsed_idx" ON "PasswordResetToken"("isUsed");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_sessionId_idx" ON "AuditLog"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE INDEX "Profile_city_idx" ON "Profile"("city");

-- CreateIndex
CREATE INDEX "Profile_state_idx" ON "Profile"("state");

-- CreateIndex
CREATE INDEX "Profile_country_idx" ON "Profile"("country");

-- CreateIndex
CREATE UNIQUE INDEX "Branch_branchCode_key" ON "Branch"("branchCode");

-- CreateIndex
CREATE INDEX "Branch_branchName_idx" ON "Branch"("branchName");

-- CreateIndex
CREATE INDEX "Branch_branchCode_idx" ON "Branch"("branchCode");

-- CreateIndex
CREATE INDEX "Branch_status_idx" ON "Branch"("status");

-- CreateIndex
CREATE INDEX "Branch_deletedAt_idx" ON "Branch"("deletedAt");

-- CreateIndex
CREATE INDEX "Branch_status_deletedAt_idx" ON "Branch"("status", "deletedAt");

-- CreateIndex
CREATE INDEX "Branch_city_idx" ON "Branch"("city");

-- CreateIndex
CREATE INDEX "Branch_state_idx" ON "Branch"("state");

-- CreateIndex
CREATE INDEX "Branch_country_idx" ON "Branch"("country");

-- CreateIndex
CREATE INDEX "Branch_city_state_country_idx" ON "Branch"("city", "state", "country");

-- CreateIndex
CREATE INDEX "Branch_createdAt_idx" ON "Branch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BranchUser_email_key" ON "BranchUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BranchUser_phone_key" ON "BranchUser"("phone");

-- CreateIndex
CREATE INDEX "BranchUser_branchId_idx" ON "BranchUser"("branchId");

-- CreateIndex
CREATE INDEX "BranchUser_branchId_isDeleted_idx" ON "BranchUser"("branchId", "isDeleted");

-- CreateIndex
CREATE INDEX "BranchUser_branchId_isActive_isDeleted_idx" ON "BranchUser"("branchId", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "BranchUser_email_idx" ON "BranchUser"("email");

-- CreateIndex
CREATE INDEX "BranchUser_phone_idx" ON "BranchUser"("phone");

-- CreateIndex
CREATE INDEX "BranchUser_role_idx" ON "BranchUser"("role");

-- CreateIndex
CREATE INDEX "BranchUser_isActive_idx" ON "BranchUser"("isActive");

-- CreateIndex
CREATE INDEX "BranchUser_isDeleted_idx" ON "BranchUser"("isDeleted");

-- CreateIndex
CREATE INDEX "BranchUser_createdAt_idx" ON "BranchUser"("createdAt");

-- CreateIndex
CREATE INDEX "File_fileName_idx" ON "File"("fileName");

-- CreateIndex
CREATE INDEX "File_mimeType_idx" ON "File"("mimeType");

-- CreateIndex
CREATE INDEX "File_provider_idx" ON "File"("provider");

-- CreateIndex
CREATE INDEX "File_visibility_idx" ON "File"("visibility");

-- CreateIndex
CREATE INDEX "File_uploadedBy_idx" ON "File"("uploadedBy");

-- CreateIndex
CREATE INDEX "File_branchId_idx" ON "File"("branchId");

-- CreateIndex
CREATE INDEX "File_branchId_isDeleted_idx" ON "File"("branchId", "isDeleted");

-- CreateIndex
CREATE INDEX "File_isDeleted_idx" ON "File"("isDeleted");

-- CreateIndex
CREATE INDEX "File_createdAt_idx" ON "File"("createdAt");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Category_slug_idx" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_status_idx" ON "Category"("status");

-- CreateIndex
CREATE INDEX "Category_displayOrder_idx" ON "Category"("displayOrder");

-- CreateIndex
CREATE INDEX "Category_branchId_idx" ON "Category"("branchId");

-- CreateIndex
CREATE INDEX "Category_branchId_status_isDeleted_idx" ON "Category"("branchId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Category_isDeleted_idx" ON "Category"("isDeleted");

-- CreateIndex
CREATE INDEX "Category_createdAt_idx" ON "Category"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_branchId_key" ON "Category"("slug", "branchId");

-- CreateIndex
CREATE INDEX "Course_title_idx" ON "Course"("title");

-- CreateIndex
CREATE INDEX "Course_slug_idx" ON "Course"("slug");

-- CreateIndex
CREATE INDEX "Course_categoryId_idx" ON "Course"("categoryId");

-- CreateIndex
CREATE INDEX "Course_status_idx" ON "Course"("status");

-- CreateIndex
CREATE INDEX "Course_isFeatured_idx" ON "Course"("isFeatured");

-- CreateIndex
CREATE INDEX "Course_isPopular_idx" ON "Course"("isPopular");

-- CreateIndex
CREATE INDEX "Course_displayOrder_idx" ON "Course"("displayOrder");

-- CreateIndex
CREATE INDEX "Course_categoryId_status_isDeleted_idx" ON "Course"("categoryId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Course_isDeleted_idx" ON "Course"("isDeleted");

-- CreateIndex
CREATE INDEX "Course_createdAt_idx" ON "Course"("createdAt");

-- CreateIndex
CREATE INDEX "CourseBranch_courseId_idx" ON "CourseBranch"("courseId");

-- CreateIndex
CREATE INDEX "CourseBranch_branchId_idx" ON "CourseBranch"("branchId");

-- CreateIndex
CREATE INDEX "CourseImage_courseId_idx" ON "CourseImage"("courseId");

-- CreateIndex
CREATE INDEX "CourseImage_fileId_idx" ON "CourseImage"("fileId");

-- CreateIndex
CREATE INDEX "CourseImage_displayOrder_idx" ON "CourseImage"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseMaterial_courseId_idx" ON "CourseMaterial"("courseId");

-- CreateIndex
CREATE INDEX "CourseMaterial_fileId_idx" ON "CourseMaterial"("fileId");

-- CreateIndex
CREATE INDEX "CourseMaterial_type_idx" ON "CourseMaterial"("type");

-- CreateIndex
CREATE INDEX "CourseMaterial_displayOrder_idx" ON "CourseMaterial"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_idx" ON "CourseModule"("courseId");

-- CreateIndex
CREATE INDEX "CourseModule_slug_idx" ON "CourseModule"("slug");

-- CreateIndex
CREATE INDEX "CourseModule_displayOrder_idx" ON "CourseModule"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseModule_courseId_isDeleted_idx" ON "CourseModule"("courseId", "isDeleted");

-- CreateIndex
CREATE INDEX "CourseModule_isDeleted_idx" ON "CourseModule"("isDeleted");

-- CreateIndex
CREATE INDEX "CourseModule_createdAt_idx" ON "CourseModule"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseModule_courseId_slug_key" ON "CourseModule"("courseId", "slug");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_idx" ON "CourseLesson"("moduleId");

-- CreateIndex
CREATE INDEX "CourseLesson_slug_idx" ON "CourseLesson"("slug");

-- CreateIndex
CREATE INDEX "CourseLesson_displayOrder_idx" ON "CourseLesson"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseLesson_moduleId_isDeleted_idx" ON "CourseLesson"("moduleId", "isDeleted");

-- CreateIndex
CREATE INDEX "CourseLesson_isDeleted_idx" ON "CourseLesson"("isDeleted");

-- CreateIndex
CREATE INDEX "CourseLesson_createdAt_idx" ON "CourseLesson"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourseLesson_moduleId_slug_key" ON "CourseLesson"("moduleId", "slug");

-- CreateIndex
CREATE INDEX "CourseResource_lessonId_idx" ON "CourseResource"("lessonId");

-- CreateIndex
CREATE INDEX "CourseResource_displayOrder_idx" ON "CourseResource"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseResource_type_idx" ON "CourseResource"("type");

-- CreateIndex
CREATE INDEX "CourseResource_lessonId_isDeleted_idx" ON "CourseResource"("lessonId", "isDeleted");

-- CreateIndex
CREATE INDEX "CourseResource_isDeleted_idx" ON "CourseResource"("isDeleted");

-- CreateIndex
CREATE INDEX "CourseResource_createdAt_idx" ON "CourseResource"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_email_key" ON "Trainer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_phone_key" ON "Trainer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Trainer_employeeCode_key" ON "Trainer"("employeeCode");

-- CreateIndex
CREATE INDEX "Trainer_firstName_idx" ON "Trainer"("firstName");

-- CreateIndex
CREATE INDEX "Trainer_lastName_idx" ON "Trainer"("lastName");

-- CreateIndex
CREATE INDEX "Trainer_email_idx" ON "Trainer"("email");

-- CreateIndex
CREATE INDEX "Trainer_phone_idx" ON "Trainer"("phone");

-- CreateIndex
CREATE INDEX "Trainer_employeeCode_idx" ON "Trainer"("employeeCode");

-- CreateIndex
CREATE INDEX "Trainer_trainerType_idx" ON "Trainer"("trainerType");

-- CreateIndex
CREATE INDEX "Trainer_branchId_idx" ON "Trainer"("branchId");

-- CreateIndex
CREATE INDEX "Trainer_status_idx" ON "Trainer"("status");

-- CreateIndex
CREATE INDEX "Trainer_isFeatured_idx" ON "Trainer"("isFeatured");

-- CreateIndex
CREATE INDEX "Trainer_branchId_status_isDeleted_idx" ON "Trainer"("branchId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Trainer_isDeleted_idx" ON "Trainer"("isDeleted");

-- CreateIndex
CREATE INDEX "Trainer_createdAt_idx" ON "Trainer"("createdAt");

-- CreateIndex
CREATE INDEX "TrainerCourse_trainerId_idx" ON "TrainerCourse"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerCourse_courseId_idx" ON "TrainerCourse"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerCourse_trainerId_courseId_key" ON "TrainerCourse"("trainerId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_code_key" ON "Batch"("code");

-- CreateIndex
CREATE INDEX "Batch_name_idx" ON "Batch"("name");

-- CreateIndex
CREATE INDEX "Batch_code_idx" ON "Batch"("code");

-- CreateIndex
CREATE INDEX "Batch_slug_idx" ON "Batch"("slug");

-- CreateIndex
CREATE INDEX "Batch_courseId_idx" ON "Batch"("courseId");

-- CreateIndex
CREATE INDEX "Batch_branchId_idx" ON "Batch"("branchId");

-- CreateIndex
CREATE INDEX "Batch_status_idx" ON "Batch"("status");

-- CreateIndex
CREATE INDEX "Batch_isActive_idx" ON "Batch"("isActive");

-- CreateIndex
CREATE INDEX "Batch_isFeatured_idx" ON "Batch"("isFeatured");

-- CreateIndex
CREATE INDEX "Batch_startDate_idx" ON "Batch"("startDate");

-- CreateIndex
CREATE INDEX "Batch_branchId_status_isDeleted_idx" ON "Batch"("branchId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Batch_courseId_status_isDeleted_idx" ON "Batch"("courseId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Batch_isDeleted_idx" ON "Batch"("isDeleted");

-- CreateIndex
CREATE INDEX "Batch_createdAt_idx" ON "Batch"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_slug_branchId_key" ON "Batch"("slug", "branchId");

-- CreateIndex
CREATE INDEX "BatchTrainer_batchId_idx" ON "BatchTrainer"("batchId");

-- CreateIndex
CREATE INDEX "BatchTrainer_trainerId_idx" ON "BatchTrainer"("trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchTrainer_batchId_trainerId_key" ON "BatchTrainer"("batchId", "trainerId");

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_phone_key" ON "Student"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Student_studentCode_key" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Student_firstName_idx" ON "Student"("firstName");

-- CreateIndex
CREATE INDEX "Student_lastName_idx" ON "Student"("lastName");

-- CreateIndex
CREATE INDEX "Student_email_idx" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Student_phone_idx" ON "Student"("phone");

-- CreateIndex
CREATE INDEX "Student_studentCode_idx" ON "Student"("studentCode");

-- CreateIndex
CREATE INDEX "Student_branchId_idx" ON "Student"("branchId");

-- CreateIndex
CREATE INDEX "Student_isActive_idx" ON "Student"("isActive");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "Student_admissionDate_idx" ON "Student"("admissionDate");

-- CreateIndex
CREATE INDEX "Student_branchId_status_isDeleted_idx" ON "Student"("branchId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "Student_isDeleted_idx" ON "Student"("isDeleted");

-- CreateIndex
CREATE INDEX "Student_createdAt_idx" ON "Student"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_enrollmentNumber_key" ON "Enrollment"("enrollmentNumber");

-- CreateIndex
CREATE INDEX "Enrollment_studentId_idx" ON "Enrollment"("studentId");

-- CreateIndex
CREATE INDEX "Enrollment_branchId_idx" ON "Enrollment"("branchId");

-- CreateIndex
CREATE INDEX "Enrollment_categoryId_idx" ON "Enrollment"("categoryId");

-- CreateIndex
CREATE INDEX "Enrollment_courseId_idx" ON "Enrollment"("courseId");

-- CreateIndex
CREATE INDEX "Enrollment_batchId_idx" ON "Enrollment"("batchId");

-- CreateIndex
CREATE INDEX "Enrollment_status_idx" ON "Enrollment"("status");

-- CreateIndex
CREATE INDEX "Enrollment_paymentStatus_idx" ON "Enrollment"("paymentStatus");

-- CreateIndex
CREATE INDEX "Enrollment_isActive_idx" ON "Enrollment"("isActive");

-- CreateIndex
CREATE INDEX "Enrollment_isDeleted_idx" ON "Enrollment"("isDeleted");

-- CreateIndex
CREATE INDEX "Enrollment_createdAt_idx" ON "Enrollment"("createdAt");

-- CreateIndex
CREATE INDEX "Enrollment_branchId_status_isDeleted_idx" ON "Enrollment"("branchId", "status", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_studentId_batchId_key" ON "Enrollment"("studentId", "batchId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_gatewayPaymentId_key" ON "Payment"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "Payment_enrollmentId_idx" ON "Payment"("enrollmentId");

-- CreateIndex
CREATE INDEX "Payment_studentId_idx" ON "Payment"("studentId");

-- CreateIndex
CREATE INDEX "Payment_paymentStatus_idx" ON "Payment"("paymentStatus");

-- CreateIndex
CREATE INDEX "Payment_paymentMethod_idx" ON "Payment"("paymentMethod");

-- CreateIndex
CREATE INDEX "Payment_gateway_idx" ON "Payment"("gateway");

-- CreateIndex
CREATE INDEX "Payment_gatewayOrderId_idx" ON "Payment"("gatewayOrderId");

-- CreateIndex
CREATE INDEX "Payment_gatewayPaymentId_idx" ON "Payment"("gatewayPaymentId");

-- CreateIndex
CREATE INDEX "Payment_transactionId_idx" ON "Payment"("transactionId");

-- CreateIndex
CREATE INDEX "Payment_isDeleted_idx" ON "Payment"("isDeleted");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_enrollmentId_paymentStatus_idx" ON "Payment"("enrollmentId", "paymentStatus");

-- CreateIndex
CREATE UNIQUE INDEX "Job_slug_key" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_slug_idx" ON "Job"("slug");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_isActive_idx" ON "Job"("isActive");

-- CreateIndex
CREATE INDEX "Job_isDeleted_idx" ON "Job"("isDeleted");

-- CreateIndex
CREATE INDEX "Job_status_isActive_isDeleted_idx" ON "Job"("status", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "Job_employmentType_idx" ON "Job"("employmentType");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_idx" ON "JobApplication"("jobId");

-- CreateIndex
CREATE INDEX "JobApplication_status_idx" ON "JobApplication"("status");

-- CreateIndex
CREATE INDEX "JobApplication_isDeleted_idx" ON "JobApplication"("isDeleted");

-- CreateIndex
CREATE INDEX "JobApplication_createdAt_idx" ON "JobApplication"("createdAt");

-- CreateIndex
CREATE INDEX "JobApplication_jobId_status_isDeleted_idx" ON "JobApplication"("jobId", "status", "isDeleted");

-- CreateIndex
CREATE INDEX "JobApplication_studentId_idx" ON "JobApplication"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "JobApplication_jobId_studentId_key" ON "JobApplication"("jobId", "studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_applicationId_key" ON "Placement"("applicationId");

-- CreateIndex
CREATE INDEX "Placement_jobId_idx" ON "Placement"("jobId");

-- CreateIndex
CREATE INDEX "Placement_status_idx" ON "Placement"("status");

-- CreateIndex
CREATE INDEX "Placement_createdAt_idx" ON "Placement"("createdAt");

-- CreateIndex
CREATE INDEX "Placement_studentId_idx" ON "Placement"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialArticle_slug_key" ON "FinancialArticle"("slug");

-- CreateIndex
CREATE INDEX "FinancialArticle_slug_idx" ON "FinancialArticle"("slug");

-- CreateIndex
CREATE INDEX "FinancialArticle_categoryId_idx" ON "FinancialArticle"("categoryId");

-- CreateIndex
CREATE INDEX "FinancialArticle_status_idx" ON "FinancialArticle"("status");

-- CreateIndex
CREATE INDEX "FinancialArticle_isActive_idx" ON "FinancialArticle"("isActive");

-- CreateIndex
CREATE INDEX "FinancialArticle_isDeleted_idx" ON "FinancialArticle"("isDeleted");

-- CreateIndex
CREATE INDEX "FinancialArticle_displayOrder_idx" ON "FinancialArticle"("displayOrder");

-- CreateIndex
CREATE INDEX "FinancialArticle_status_isActive_isDeleted_idx" ON "FinancialArticle"("status", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "FinancialArticle_createdAt_idx" ON "FinancialArticle"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityPost_status_idx" ON "CommunityPost"("status");

-- CreateIndex
CREATE INDEX "CommunityPost_isActive_idx" ON "CommunityPost"("isActive");

-- CreateIndex
CREATE INDEX "CommunityPost_isDeleted_idx" ON "CommunityPost"("isDeleted");

-- CreateIndex
CREATE INDEX "CommunityPost_status_isActive_isDeleted_idx" ON "CommunityPost"("status", "isActive", "isDeleted");

-- CreateIndex
CREATE INDEX "CommunityPost_createdAt_idx" ON "CommunityPost"("createdAt");

-- CreateIndex
CREATE INDEX "CommunityPostLike_postId_idx" ON "CommunityPostLike"("postId");

-- CreateIndex
CREATE INDEX "CommunityPostLike_userId_idx" ON "CommunityPostLike"("userId");

-- CreateIndex
CREATE INDEX "CommunityPostLike_isDeleted_idx" ON "CommunityPostLike"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityPostLike_postId_userId_key" ON "CommunityPostLike"("postId", "userId");

-- CreateIndex
CREATE INDEX "CommunityPostComment_postId_idx" ON "CommunityPostComment"("postId");

-- CreateIndex
CREATE INDEX "CommunityPostComment_userId_idx" ON "CommunityPostComment"("userId");

-- CreateIndex
CREATE INDEX "CommunityPostComment_parentId_idx" ON "CommunityPostComment"("parentId");

-- CreateIndex
CREATE INDEX "CommunityPostComment_isDeleted_idx" ON "CommunityPostComment"("isDeleted");

-- CreateIndex
CREATE INDEX "CommunityPostComment_isBlocked_idx" ON "CommunityPostComment"("isBlocked");

-- CreateIndex
CREATE INDEX "CommunityPostComment_postId_isDeleted_isBlocked_idx" ON "CommunityPostComment"("postId", "isDeleted", "isBlocked");

-- CreateIndex
CREATE INDEX "CommunityPostComment_createdAt_idx" ON "CommunityPostComment"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BranchUser" ADD CONSTRAINT "BranchUser_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBranch" ADD CONSTRAINT "CourseBranch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseBranch" ADD CONSTRAINT "CourseBranch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseImage" ADD CONSTRAINT "CourseImage_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseImage" ADD CONSTRAINT "CourseImage_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseMaterial" ADD CONSTRAINT "CourseMaterial_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseModule" ADD CONSTRAINT "CourseModule_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseResource" ADD CONSTRAINT "CourseResource_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trainer" ADD CONSTRAINT "Trainer_profileImageFileId_fkey" FOREIGN KEY ("profileImageFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCourse" ADD CONSTRAINT "TrainerCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainerCourse" ADD CONSTRAINT "TrainerCourse_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTrainer" ADD CONSTRAINT "BatchTrainer_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTrainer" ADD CONSTRAINT "BatchTrainer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_profileImageFileId_fkey" FOREIGN KEY ("profileImageFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_resumeFileId_fkey" FOREIGN KEY ("resumeFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobApplication" ADD CONSTRAINT "JobApplication_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "JobApplication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialArticle" ADD CONSTRAINT "FinancialArticle_bannerFileId_fkey" FOREIGN KEY ("bannerFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialArticle" ADD CONSTRAINT "FinancialArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinancialArticle" ADD CONSTRAINT "FinancialArticle_thumbnailFileId_fkey" FOREIGN KEY ("thumbnailFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPost" ADD CONSTRAINT "CommunityPost_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostLike" ADD CONSTRAINT "CommunityPostLike_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostLike" ADD CONSTRAINT "CommunityPostLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostComment" ADD CONSTRAINT "CommunityPostComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "CommunityPostComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostComment" ADD CONSTRAINT "CommunityPostComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityPostComment" ADD CONSTRAINT "CommunityPostComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

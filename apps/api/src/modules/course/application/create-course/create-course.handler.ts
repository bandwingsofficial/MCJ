import { randomUUID } from 'crypto';
import { Logger } from '@nestjs/common';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { CourseImage } from '../../domain/entities/course-image.entity';
import { CourseMaterial } from '../../domain/entities/course-material.entity';
import { Course } from '../../domain/entities/course.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseStatus } from '../../domain/enums/course-status.enum';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';

import {
  GetCourseResult,
  CourseBranchResult,
} from '../get-course/get-course.result';

import { CreateCourseCommand } from './create-course.command';

import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

import { InvalidCoursePricingException } from '../../domain/errors/invalid-course-pricing.exception';

const COURSE_UPLOAD_FOLDER = 'courses';
const COURSE_THUMBNAIL_FILE_NAME = 'thumbnail';

export class CreateCourseHandler {
  private readonly logger = new Logger(CreateCourseHandler.name);

  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly domainService: CourseDomainService,
    private readonly branchRepo: BranchRepository,
    private readonly uploadDomainService: UploadDomainService,
  ) {}

  async execute(command: CreateCourseCommand): Promise<GetCourseResult> {
    await this.domainService.ensureCategoryExists(
      this.categoryRepo,
      command.categoryId,
    );

    if (command.branchIds.length > 0) {
      for (const branchId of command.branchIds) {
        const branch = await this.branchRepo.findById(branchId);

        if (!branch) {
          throw new BranchNotFoundException(branchId);
        }
      }
    }

    if (
      command.originalPrice &&
      command.discountPrice &&
      command.discountPrice > command.originalPrice
    ) {
      throw new InvalidCoursePricingException(
        'Discount price cannot be greater than original price',
      );
    }

    if (
      command.isFree &&
      ((command.originalPrice ?? 0) > 0 ||
        (command.discountPrice ?? 0) > 0)
    ) {
      throw new InvalidCoursePricingException(
        'Free courses cannot have original price or discount price',
      );
    }

    const slug = command.slug
      ? Slug.create(command.slug).getValue()
      : Slug.fromTitle(command.title).getValue();

    await this.domainService.ensureSlugIsAvailable(
      this.courseRepo,
      slug,
    );

    const courseId = randomUUID();
    let thumbnailFileId: string | null = null;
    let thumbnailUrl: string | null = null;

    if (command.thumbnailFileId) {
      const upload = await this.uploadDomainService.attachToEntity({
        uploadId: command.thumbnailFileId,
        folder: COURSE_UPLOAD_FOLDER,
        entityId: courseId,
        fileName: COURSE_THUMBNAIL_FILE_NAME,
      });

      thumbnailFileId = upload.id;
      thumbnailUrl = upload.url;
    }

    const images: CourseImage[] = [];

    for (const [index, image] of command.images.entries()) {
      const imageId = randomUUID();

      const upload = await this.uploadDomainService.attachOrReplaceSlot({
        uploadId: image.fileId,
        folder: COURSE_UPLOAD_FOLDER,
        entityId: courseId,
        subFolder: 'gallery',
        slotFileName: imageId,
      });

      images.push(
        CourseImage.create({
          id: imageId,
          courseId,
          fileId: upload.id,
          displayOrder: image.displayOrder ?? index,
        }),
      );
    }

    const materials: CourseMaterial[] = [];

    for (const [index, material] of command.materials.entries()) {
      const materialId = randomUUID();
      let fileId: string | null = material.fileId ?? null;

      if (material.fileId) {
        const slotFileName =
          await this.uploadDomainService.resolveSlotDocumentFileName(
            material.fileId,
            materialId,
          );

        const upload = await this.uploadDomainService.attachOrReplaceSlot({
          uploadId: material.fileId,
          folder: COURSE_UPLOAD_FOLDER,
          entityId: courseId,
          subFolder: 'materials',
          slotFileName,
        });

        fileId = upload.id;
      }

      materials.push(
        CourseMaterial.create({
          id: materialId,
          courseId,
          title: material.title,
          type: material.type,
          fileId,
          externalUrl: material.externalUrl,
          displayOrder: material.displayOrder ?? index,
        }),
      );
    }

    const status = command.status ?? CourseStatus.DRAFT;
    const displayOrder =
      command.displayOrder ??
      (status === CourseStatus.ACTIVE
        ? (await this.courseRepo.getMaxActiveDisplayOrder()) + 1
        : null);

    const course = Course.create({
      id: courseId,
      title: command.title,
      slug,
      tagline: command.tagline,
      shortDescription: command.shortDescription,
      description: command.description,
      thumbnailFileId,
      thumbnailUrl,
      originalPrice: command.originalPrice,
      discountPrice: command.discountPrice,
      currency: command.currency,
      isFree: command.isFree,
      duration: command.duration,
      durationType: command.durationType,
      level: command.level,
      modes: command.modes,
      language: command.language,
      averageRating: command.averageRating,
      totalReviews: command.totalReviews,
      isFeatured: command.isFeatured,
      isPopular: command.isPopular,
      displayOrder,
      metaTitle: command.metaTitle ?? command.title,
      metaDescription:
        command.metaDescription ??
        command.shortDescription ??
        command.description,
      metaKeywords:
        command.metaKeywords ??
        command.title.split(' ').join(','),
      categoryId: command.categoryId,
      branchIds: command.branchIds,
      status,
      images,
      materials,
      createdBy: command.createdBy,
    });

    await this.courseRepo.save(course);

    const branchEntities = await Promise.all(
      course.branchIds.map(async (branchId) => {
        const branch = await this.branchRepo.findById(branchId);

        if (!branch) {
          throw new BranchNotFoundException(branchId);
        }

        return branch;
      }),
    );

    const branches = branchEntities.map(
      (branch) =>
        new CourseBranchResult(
          branch.id,
          branch.branchName.getValue(),
          branch.branchCode.getValue(),
        ),
    );

    this.logger.log(`✅ Course created: ${course.id}`);

    return GetCourseResult.fromEntity(course, branches);
  }
}

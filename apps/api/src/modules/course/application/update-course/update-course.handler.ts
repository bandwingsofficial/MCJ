import { randomUUID } from 'crypto';
import type { CategoryRepository } from '@modules/category/domain/repositories/category.repository';
import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import { ERROR_CODES } from '@common/constants/error-codes';
import { BaseException } from '@common/exceptions/base.exception';

import { CourseImage } from '../../domain/entities/course-image.entity';
import { CourseMaterial } from '../../domain/entities/course-material.entity';
import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';
import { Slug } from '../../domain/value-objects/slug.vo';
import {
  GetCourseResult,
  CourseBranchResult,
  CourseCategoryResult,
  CourseTrainerResult,
} from '../get-course/get-course.result';

import { UpdateCourseCommand } from './update-course.command';
import { BranchRepository } from '@/modules/branch/domain/repositories/branch.repository';
import { BranchNotFoundException } from '@/modules/branch/domain/errors/branch-not-found.exception';

const COURSE_UPLOAD_FOLDER = 'courses';
const COURSE_THUMBNAIL_FILE_NAME = 'thumbnail';

export class UpdateCourseHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly categoryRepo: CategoryRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: CourseDomainService,
    private readonly branchRepo: BranchRepository,
  ) {}

  async execute(command: UpdateCourseCommand): Promise<GetCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.id),
    );

    if (command.categoryId) {
      await this.domainService.ensureCategoryExists(
        this.categoryRepo,
        command.categoryId,
      );
    }
    if (command.branchIds?.length) {
      for (const branchId of command.branchIds) {
        const branch = await this.branchRepo.findById(branchId);

        if (!branch) {
          throw new BranchNotFoundException(branchId);
        }
      }
    }

    const nextSlug =
      command.slug !== undefined
        ? Slug.create(command.slug).getValue()
        : command.title !== undefined
          ? Slug.fromTitle(command.title).getValue()
          : course.slug.getValue();

    await this.domainService.ensureSlugIsAvailable(
      this.courseRepo,
      nextSlug,
      course.id,
    );

    const oldFileIds = this.collectFileIds(course);

    let nextThumbnailFileId = course.thumbnailFileId;
    let nextThumbnailUrl = course.thumbnailUrl;

    if (
      command.thumbnailFileId !== undefined &&
      command.thumbnailFileId !== course.thumbnailFileId
    ) {
      if (command.thumbnailFileId) {
        const upload =
          await this.uploadDomainService.replaceLinkedUpload({
            previousUploadId: course.thumbnailFileId,
            nextUploadId: command.thumbnailFileId,
            folder: COURSE_UPLOAD_FOLDER,
            entityId: course.id,
            fileName: COURSE_THUMBNAIL_FILE_NAME,
            updatedBy: command.updatedBy,
          });

        nextThumbnailFileId = upload.id;
        nextThumbnailUrl = upload.url;
      } else {
        if (course.thumbnailFileId) {
          await this.uploadDomainService.softDelete(
            course.thumbnailFileId,
            command.updatedBy,
          );
        }

        nextThumbnailFileId = null;
        nextThumbnailUrl = null;
      }
    }

    let nextImages = course.images;
    if (command.images !== undefined) {
      nextImages = [];

      for (const [index, image] of command.images.entries()) {
        const retained = course.images.find(
          (existing) => existing.fileId === image.fileId,
        );

        if (retained) {
          nextImages.push(
            CourseImage.create({
              id: retained.id,
              courseId: course.id,
              fileId: retained.fileId,
              displayOrder: image.displayOrder ?? index,
            }),
          );
          continue;
        }

        const slotImage = course.images[index];
        const imageId = slotImage?.id ?? randomUUID();
        const previousUploadId = slotImage?.fileId ?? null;

        const upload = await this.uploadDomainService.attachOrReplaceSlot({
          uploadId: image.fileId,
          folder: COURSE_UPLOAD_FOLDER,
          entityId: course.id,
          subFolder: 'gallery',
          slotFileName: imageId,
          previousUploadId,
          updatedBy: command.updatedBy,
        });

        nextImages.push(
          CourseImage.create({
            id: imageId,
            courseId: course.id,
            fileId: upload.id,
            displayOrder: image.displayOrder ?? index,
          }),
        );
      }
    }

    let nextMaterials = course.materials;
    if (command.materials !== undefined) {
      nextMaterials = [];

      for (const [index, material] of command.materials.entries()) {
        const retained = course.materials.find(
          (existing) =>
            material.fileId &&
            existing.fileId === material.fileId,
        );

        if (retained) {
          nextMaterials.push(
            CourseMaterial.create({
              id: retained.id,
              courseId: course.id,
              title: material.title,
              type: material.type,
              fileId: retained.fileId,
              externalUrl: material.externalUrl,
              displayOrder: material.displayOrder ?? index,
            }),
          );
          continue;
        }

        const slotMaterial = course.materials[index];
        const materialId = slotMaterial?.id ?? randomUUID();
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
            entityId: course.id,
            subFolder: 'materials',
            slotFileName,
            previousUploadId: slotMaterial?.fileId ?? null,
            updatedBy: command.updatedBy,
          });

          fileId = upload.id;
        }

        nextMaterials.push(
          CourseMaterial.create({
            id: materialId,
            courseId: course.id,
            title: material.title,
            type: material.type,
            fileId,
            externalUrl: material.externalUrl,
            displayOrder: material.displayOrder ?? index,
          }),
        );
      }
    }

    course.update({
      title: command.title,
      categoryId: command.categoryId,
      slug: nextSlug,
      tagline: command.tagline,
      shortDescription: command.shortDescription,
      description: command.description,
      thumbnailFileId: nextThumbnailFileId,
      thumbnailUrl: nextThumbnailUrl,
      duration: command.duration,
      durationType: command.durationType,
      level: command.level,
      minimumQualifications: command.minimumQualifications,
      language: command.language,
      averageRating: command.averageRating,
      totalReviews: command.totalReviews,
      isFeatured: command.isFeatured,
      isPopular: command.isPopular,
      displayOrder: command.displayOrder,
      metaTitle: command.metaTitle ?? command.title ?? course.metaTitle,
      metaDescription:
        command.metaDescription ??
        command.shortDescription ??
        command.description ??
        course.metaDescription,
      metaKeywords:
        command.metaKeywords ??
        (command.title
          ? command.title.split(' ').join(',')
          : course.metaKeywords),
      branchIds: command.branchIds,
      images: nextImages,
      materials: nextMaterials,
      updatedBy: command.updatedBy,
    });

    await this.courseRepo.save(course);

    await this.uploadDomainService.softDeleteReplacedUploads(
      oldFileIds,
      this.collectFileIds(course),
      command.updatedBy,
    );

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

    const categoryEntity = await this.categoryRepo.findById(
      course.categoryId,
    );
    const category = categoryEntity
      ? new CourseCategoryResult(
          categoryEntity.id,
          categoryEntity.name.getValue(),
        )
      : null;

    if (command.trainerIds !== undefined) {
      const trainersAssignable = await this.courseRepo.areNewTrainersActive(
        course.id,
        command.trainerIds,
      );

      if (!trainersAssignable) {
        throw new BaseException(
          ERROR_CODES.VALIDATION_ERROR,
          'Only active trainers can be assigned to a course',
          400,
        );
      }

      await this.courseRepo.syncTrainers(course.id, command.trainerIds);
    }

    const trainers = (
      await this.courseRepo.findTrainersByCourseId(course.id)
    ).map(
      (trainer) =>
        new CourseTrainerResult(
          trainer.id,
          trainer.firstName,
          trainer.lastName,
          trainer.employeeCode,
          trainer.qualification,
          trainer.specialization,
          trainer.status,
          trainer.profileImageUrl,
          trainer.email,
        ),
    );

    return GetCourseResult.fromEntity(course, branches, {
      category,
      categoryName: category?.name ?? null,
      trainers,
    });
  }

  private collectFileIds(course: {
    thumbnailFileId: string | null;
    images: { fileId: string }[];
    materials: { fileId: string | null }[];
  }): string[] {
    return [
      course.thumbnailFileId,
      ...course.images.map((image) => image.fileId),
      ...course.materials.map((material) => material.fileId),
    ].filter((fileId): fileId is string => Boolean(fileId));
  }
}

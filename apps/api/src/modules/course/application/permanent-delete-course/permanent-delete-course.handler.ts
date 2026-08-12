import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import type { CourseRepository } from '../../domain/repositories/course.repository';
import { CourseDomainService } from '../../domain/services/course-domain.service';

import { PermanentDeleteCourseCommand } from './permanent-delete-course.command';
import { PermanentDeleteCourseResult } from './permanent-delete-course.result';

export class PermanentDeleteCourseHandler {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly uploadDomainService: UploadDomainService,
    private readonly domainService: CourseDomainService,
  ) {}

  async execute(
    command: PermanentDeleteCourseCommand,
  ): Promise<PermanentDeleteCourseResult> {
    const course = await this.domainService.ensureExists(
      await this.courseRepo.findById(command.id, true),
    );
    const fileIds = this.collectFileIds(course);

    await this.courseRepo.deletePermanent(course.id);

    await this.uploadDomainService.permanentDeleteMany(fileIds);

    return new PermanentDeleteCourseResult(course.id, true);
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

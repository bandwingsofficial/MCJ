import { CourseModule } from '../../domain/entities/course-module.entity';
import { CourseModuleResult } from '../../application/course-module.result';

export class CourseModuleResponseMapper {
  static toResult(module: CourseModule): CourseModuleResult {
    return new CourseModuleResult(
      module.id,
      module.courseId,
      module.title,
      module.slug.getValue(),
      module.description,
      module.keySkills,
      module.thumbnailUrl,
      module.duration,
      module.displayOrder,
      module.createdBy,
      module.updatedBy,
      module.isDeleted,
      module.deletedAt,
      module.createdAt,
      module.updatedAt,
    );
  }

  static toResultList(
    modules: CourseModule[],
  ): CourseModuleResult[] {
    return modules.map((module) => this.toResult(module));
  }
}

import { CourseModule } from '../../domain/entities/course-module.entity';
import { CourseModuleResult } from '../../application/course-module.result';
import type { ModuleContentCounts } from '../../../course/domain/services/course-content-counts';
import { emptyModuleContentCounts } from '../../../course/domain/services/course-content-counts';
import { CourseHierarchyService } from '../../../course/infrastructure/services/course-hierarchy.service';

export class CourseModuleResponseMapper {
  static toResult(
    module: CourseModule,
    counts: ModuleContentCounts = emptyModuleContentCounts(),
  ): CourseModuleResult {
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
      counts.lessonCount,
      counts.resourceCount,
      counts.quizCount,
      counts.assignmentCount,
      counts.selfPacedVideoCount,
      counts.liveRecordedVideoCount,
    );
  }

  static toResultList(
    modules: CourseModule[],
    countsByModuleId: Map<string, ModuleContentCounts> = new Map(),
  ): CourseModuleResult[] {
    return modules.map((module) =>
      this.toResult(
        module,
        countsByModuleId.get(module.id) ?? emptyModuleContentCounts(),
      ),
    );
  }

  static async toResultWithCounts(
    module: CourseModule,
    hierarchyService: CourseHierarchyService,
  ): Promise<CourseModuleResult> {
    const countsByModuleId = await hierarchyService.getModuleCountsByIds([
      module.id,
    ]);

    return this.toResult(module, countsByModuleId.get(module.id));
  }
}

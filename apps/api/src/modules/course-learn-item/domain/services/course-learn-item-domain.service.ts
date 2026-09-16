import { CourseLearnItem } from '../entities/course-learn-item.entity';
import { CourseLearnItemNotFoundException } from '../errors/course-learn-item-not-found.exception';

export class CourseLearnItemDomainService {
  ensureExists(item: CourseLearnItem | null): CourseLearnItem {
    if (!item) {
      throw new CourseLearnItemNotFoundException();
    }

    return item;
  }
}

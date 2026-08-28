import {
  hydrateFacultyBatchRelations,
  resolveAssignedCourses,
  resolveAssignedTrainers,
  uniqueById,
} from './batch-relation-resolve';

describe('batch relation resolve', () => {
  it('resolves BatchCourse when Batch.courseId is null', () => {
    const assigned = { id: 'course-ca', title: 'CA Foundation' };
    expect(resolveAssignedCourses(null, [assigned])).toEqual([assigned]);
  });

  it('keeps the direct Batch.course when no BatchCourse rows exist', () => {
    const direct = { id: 'course-morning', title: 'CA Foundation' };
    expect(resolveAssignedCourses(direct, [])).toEqual([direct]);
  });

  it('does not duplicate the same course from both relations', () => {
    const course = { id: 'same', title: 'CA Foundation' };
    expect(resolveAssignedCourses(course, [course])).toEqual([course]);
  });

  it('merges batch trainers with course-level trainers like Admin', () => {
    const batchTrainer = { id: 't1', name: 'Batch Trainer' };
    const courseTrainer = { id: 't2', name: 'Course Trainer' };
    expect(
      resolveAssignedTrainers([batchTrainer], [], [courseTrainer]),
    ).toEqual([batchTrainer, courseTrainer]);
  });

  it('resolves TrainerCourse when BatchTrainer is empty', () => {
    const courseTrainer = { id: 't2', firstName: 'Akshay', lastName: 'Badiger' };
    expect(resolveAssignedTrainers([], [null], [courseTrainer])).toEqual([
      courseTrainer,
    ]);
  });

  it('hydrates Faculty list course from BatchCourse when courseId is null', () => {
    const result = hydrateFacultyBatchRelations({
      directCourse: null,
      assignmentCourses: [{ id: 'ca', title: 'CA Foundation' }],
      batchTrainers: [],
      assignmentTrainers: [null],
      courseTrainers: [
        { id: 'trainer-1', firstName: 'Akshay', lastName: 'Badiger' },
      ],
    });

    expect(result.course).toEqual({ id: 'ca', title: 'CA Foundation' });
    expect(result.trainers).toEqual([
      { id: 'trainer-1', firstName: 'Akshay', lastName: 'Badiger' },
    ]);
  });

  it('hydrates Faculty list trainer from TrainerCourse for morning and evening shapes', () => {
    const course = { id: 'ca', title: 'CA Foundation' };
    const trainer = { id: 'trainer-1', firstName: 'Akshay', lastName: 'Badiger' };

    const evening = hydrateFacultyBatchRelations({
      directCourse: null,
      assignmentCourses: [course],
      batchTrainers: [],
      assignmentTrainers: [null],
      courseTrainers: [trainer],
    });
    const morning = hydrateFacultyBatchRelations({
      directCourse: course,
      assignmentCourses: [course],
      batchTrainers: [],
      assignmentTrainers: [null],
      courseTrainers: [trainer],
    });

    expect(evening.course?.title).toBe('CA Foundation');
    expect(morning.course?.title).toBe('CA Foundation');
    expect(evening.trainers.map((item) => item.firstName)).toEqual(['Akshay']);
    expect(morning.trainers.map((item) => item.firstName)).toEqual(['Akshay']);
  });

  it('deduplicates trainers', () => {
    const trainer = { id: 't1', name: 'Ada' };
    expect(uniqueById([trainer, trainer, null])).toEqual([trainer]);
  });
});

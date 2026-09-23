import {
  hydrateFacultyBatchRelations,
  resolveAssignedCourses,
  resolveAssignedTrainers,
  resolveBranchBatchDisplayTrainers,
  resolveParentBatchAssignedTrainers,
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

  it('merges batch trainers with batch-course assignment trainers only', () => {
    const batchTrainer = { id: 't1', name: 'Batch Trainer' };
    const assignmentTrainer = { id: 't2', name: 'Session Trainer' };
    expect(
      resolveAssignedTrainers([batchTrainer], [assignmentTrainer]),
    ).toEqual([batchTrainer, assignmentTrainer]);
  });

  it('resolveBranchBatchDisplayTrainers returns only branch assignments', () => {
    const branchTrainer = { id: 't2', firstName: 'Priya', lastName: 'Nair' };

    expect(
      resolveBranchBatchDisplayTrainers([branchTrainer]).map((t) => t.id),
    ).toEqual(['t2']);
    expect(resolveBranchBatchDisplayTrainers([])).toEqual([]);
  });

  it('resolveParentBatchAssignedTrainers ignores course catalog trainers', () => {
    const batchTrainer = { id: 't1', firstName: 'Akshay', lastName: 'Badiger' };
    const batchCourseTrainer = {
      id: 't1',
      firstName: 'Akshay',
      lastName: 'Badiger',
    };
    const branchTrainer = { id: 't3', firstName: 'Branch', lastName: 'Only' };

    expect(
      resolveParentBatchAssignedTrainers(
        [batchTrainer],
        [{ trainer: batchCourseTrainer }],
        [branchTrainer],
      ).map((t) => t.id),
    ).toEqual(['t1', 't3']);
  });

  it('hydrates Faculty list course from BatchCourse when courseId is null', () => {
    const assignmentTrainer = {
      id: 'trainer-1',
      firstName: 'Akshay',
      lastName: 'Badiger',
    };
    const result = hydrateFacultyBatchRelations({
      directCourse: null,
      assignmentCourses: [{ id: 'ca', title: 'CA Foundation' }],
      batchTrainers: [],
      assignmentTrainers: [assignmentTrainer],
    });

    expect(result.course).toEqual({ id: 'ca', title: 'CA Foundation' });
    expect(result.trainers).toEqual([assignmentTrainer]);
  });

  it('hydrates batch trainers from BatchTrainer for morning and evening shapes', () => {
    const course = { id: 'ca', title: 'CA Foundation' };
    const trainer = { id: 'trainer-1', firstName: 'Akshay', lastName: 'Badiger' };

    const evening = hydrateFacultyBatchRelations({
      directCourse: null,
      assignmentCourses: [course],
      batchTrainers: [trainer],
      assignmentTrainers: [],
    });
    const morning = hydrateFacultyBatchRelations({
      directCourse: course,
      assignmentCourses: [course],
      batchTrainers: [trainer],
      assignmentTrainers: [],
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

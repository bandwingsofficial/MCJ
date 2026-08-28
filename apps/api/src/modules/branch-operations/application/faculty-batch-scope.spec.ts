import { BranchUserRole } from '@modules/branch-user/domain/enums/branch-user-role.enum';

import { resolveFacultyBatchScope } from './faculty-batch-scope';

describe('resolveFacultyBatchScope', () => {
  it('lets branch managers see every batch in the branch', () => {
    expect(
      resolveFacultyBatchScope(BranchUserRole.BRANCH_MANAGER, []),
    ).toBe('ALL_BRANCH');
  });

  it('lets unassigned faculty see every batch in the branch', () => {
    expect(resolveFacultyBatchScope(BranchUserRole.FACULTY, [])).toBe(
      'ALL_BRANCH',
    );
  });

  it('restricts faculty to explicit BatchFaculty assignments when they exist', () => {
    expect(
      resolveFacultyBatchScope(BranchUserRole.FACULTY, ['morning', 'evening']),
    ).toEqual({ in: ['morning', 'evening'] });
  });
});

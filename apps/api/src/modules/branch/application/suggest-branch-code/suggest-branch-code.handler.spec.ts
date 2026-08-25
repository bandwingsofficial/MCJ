import {
  BRANCH_CODE_PREFIX,
  SuggestBranchCodeHandler,
} from './suggest-branch-code.handler';
import { SuggestBranchCodeQuery } from './suggest-branch-code.query';

describe('SuggestBranchCodeHandler', () => {
  it('suggests the next MCJB sequential code including archived records', async () => {
    const branchRepo = {
      getMaxNumericSuffixForPrefix: jest.fn().mockResolvedValue(2),
    };

    const handler = new SuggestBranchCodeHandler(
      branchRepo as never,
    );

    const result = await handler.execute(
      new SuggestBranchCodeQuery('Any Branch Name'),
    );

    expect(
      branchRepo.getMaxNumericSuffixForPrefix,
    ).toHaveBeenCalledWith(BRANCH_CODE_PREFIX);
    expect(result.branchCode).toBe('MCJB003');
    expect(result.prefix).toBe(BRANCH_CODE_PREFIX);
  });

  it('starts at MCJB001 when no branch codes exist', async () => {
    const branchRepo = {
      getMaxNumericSuffixForPrefix: jest.fn().mockResolvedValue(0),
    };

    const handler = new SuggestBranchCodeHandler(
      branchRepo as never,
    );

    const result = await handler.execute(
      new SuggestBranchCodeQuery(''),
    );

    expect(result.branchCode).toBe('MCJB001');
  });
});

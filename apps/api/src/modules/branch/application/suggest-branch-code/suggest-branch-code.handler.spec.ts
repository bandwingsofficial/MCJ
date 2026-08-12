import {
  buildBranchCodePrefix,
  SuggestBranchCodeHandler,
} from './suggest-branch-code.handler';
import { SuggestBranchCodeQuery } from './suggest-branch-code.query';

describe('buildBranchCodePrefix', () => {
  it('builds a 3-letter prefix from branch name', () => {
    expect(buildBranchCodePrefix('Malleshwaram')).toBe('MAL');
    expect(buildBranchCodePrefix('Mangalore')).toBe('MAN');
    expect(buildBranchCodePrefix('Bangalore')).toBe('BAN');
  });

  it('pads short names', () => {
    expect(buildBranchCodePrefix('Go')).toBe('GOX');
  });

  it('falls back when no letters', () => {
    expect(buildBranchCodePrefix('123')).toBe('BRN');
  });
});

describe('SuggestBranchCodeHandler', () => {
  it('suggests next available numbered code for prefix', async () => {
    const branchRepo = {
      getMaxNumericSuffixForPrefix: jest
        .fn()
        .mockResolvedValue(3),
    };

    const handler = new SuggestBranchCodeHandler(
      branchRepo as never,
    );

    const result = await handler.execute(
      new SuggestBranchCodeQuery('Malleshwaram'),
    );

    expect(
      branchRepo.getMaxNumericSuffixForPrefix,
    ).toHaveBeenCalledWith('MAL');
    expect(result.branchCode).toBe('MAL004');
    expect(result.prefix).toBe('MAL');
  });
});

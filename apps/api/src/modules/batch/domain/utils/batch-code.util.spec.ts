import {
  formatBatchCode,
  getMonthAbbreviation,
  parseBatchCode,
  parseBatchCodeSequence,
} from './batch-code.util';

describe('batch-code.util (MCJ-MMM-XXX)', () => {
  it('formats month from start date UTC', () => {
    expect(getMonthAbbreviation(new Date(Date.UTC(2026, 7, 4)))).toBe('AUG');
    expect(getMonthAbbreviation(new Date(Date.UTC(2026, 8, 15)))).toBe('SEP');
    expect(getMonthAbbreviation(new Date(Date.UTC(2026, 9, 10)))).toBe('OCT');
  });

  it('formats codes with 3-digit padded sequence', () => {
    expect(formatBatchCode('AUG', 1)).toBe('MCJ-AUG-001');
    expect(formatBatchCode('SEP', 4)).toBe('MCJ-SEP-004');
    expect(formatBatchCode('OCT', 10)).toBe('MCJ-OCT-010');
    expect(formatBatchCode('DEC', 100)).toBe('MCJ-DEC-100');
    expect(formatBatchCode('JAN', 1001)).toBe('MCJ-JAN-1001');
  });

  it('parses global sequence from new-format codes only', () => {
    expect(parseBatchCodeSequence('MCJ-AUG-003')).toBe(3);
    expect(parseBatchCodeSequence('MCJ-SEP-004')).toBe(4);
    expect(parseBatchCodeSequence('MCJAUGM1001')).toBeNull();
    expect(parseBatchCodeSequence('BCH0001')).toBeNull();
  });

  it('parses month and sequence', () => {
    expect(parseBatchCode('MCJ-OCT-006')).toEqual({
      month: 'OCT',
      sequence: 6,
    });
  });
});

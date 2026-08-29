import {
  formatBatchSessionCode,
  formatSessionCourseLabel,
} from './batch-session.util';

describe('batch-session.util', () => {
  it('formats sequential session codes', () => {
    expect(formatBatchSessionCode(1)).toBe('S01');
    expect(formatBatchSessionCode(2)).toBe('S02');
    expect(formatBatchSessionCode(12)).toBe('S12');
  });

  it('builds session + course labels', () => {
    expect(formatSessionCourseLabel('S01', 'CA Foundation')).toBe(
      'S01 - CA Foundation',
    );
    expect(formatSessionCourseLabel(null, 'Accounting')).toBe('Accounting');
  });
});

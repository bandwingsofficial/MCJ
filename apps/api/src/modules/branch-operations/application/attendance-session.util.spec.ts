import { formatAttendanceSessionLabel } from './attendance-session.util';

describe('formatAttendanceSessionLabel', () => {
  it('formats Session N - Course Title', () => {
    expect(formatAttendanceSessionLabel(1, 'CA Foundation')).toBe(
      'Session 1 - CA Foundation',
    );
    expect(formatAttendanceSessionLabel(2, 'Frontend Development')).toBe(
      'Session 2 - Frontend Development',
    );
  });

  it('falls back when session number is missing', () => {
    expect(formatAttendanceSessionLabel(null, 'Sample Course')).toBe(
      'Sample Course',
    );
  });
});

import { hashToken } from './token.util';

describe('hashToken', () => {
  it('returns a stable sha256 hex digest', () => {
    const a = hashToken('refresh-token');
    const b = hashToken('refresh-token');

    expect(a).toBe(b);
    expect(a).toHaveLength(64);
    expect(a).not.toBe(hashToken('other-token'));
  });
});

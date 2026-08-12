import { CategoryName } from './category-name.vo';

describe('CategoryName', () => {
  it('trims and collapses whitespace', () => {
    const name = CategoryName.create('  Digital   Marketing  ');
    expect(name.getValue()).toBe('Digital Marketing');
  });

  it('builds a case-insensitive uniqueness key', () => {
    expect(CategoryName.uniquenessKey(' Abc ')).toBe('abc');
    expect(CategoryName.uniquenessKey('ABC')).toBe('abc');
  });

  it('rejects empty names', () => {
    expect(() => CategoryName.create('   ')).toThrow(
      'Category name is required',
    );
  });
});

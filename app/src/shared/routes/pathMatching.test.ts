import { isPathAllowed, isSamePath } from './pathMatching';

describe('pathMatching', () => {
  describe('isPathAllowed', () => {
    it('matches a static allowed path', () => {
      expect(isPathAllowed('/profile', ['/diary', '/profile'])).toBe(true);
    });

    it('matches a dynamic path segment', () => {
      expect(isPathAllowed('/diary/entry-1', ['/diary/[id]'])).toBe(true);
    });

    it('normalizes query strings and trailing slashes', () => {
      expect(isPathAllowed('/diary/?page=2', ['/diary'])).toBe(true);
    });

    it('rejects a path outside the allowed list', () => {
      expect(isPathAllowed('/cloud', ['/diary', '/profile'])).toBe(false);
    });
  });

  describe('isSamePath', () => {
    it('preserves root path semantics', () => {
      expect(isSamePath('/', '/')).toBe(true);
    });

    it('ignores trailing slashes', () => {
      expect(isSamePath('/diary///', '/diary')).toBe(true);
    });

    it('ignores query strings', () => {
      expect(isSamePath('/diary/?page=2', '/diary')).toBe(true);
    });

    it('distinguishes different paths', () => {
      expect(isSamePath('/diary', '/cloud')).toBe(false);
    });
  });
});

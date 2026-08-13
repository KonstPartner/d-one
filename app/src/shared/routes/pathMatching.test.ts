import { isPathAllowed, isSamePath, normalizePath } from './pathMatching';

describe('pathMatching', () => {
  describe('normalizePath', () => {
    it('preserves root path', () => {
      expect(normalizePath('/')).toBe('/');
    });

    it('removes trailing slashes', () => {
      expect(normalizePath('/diary///')).toBe('/diary');
    });

    it('removes query string', () => {
      expect(normalizePath('/diary/?page=2')).toBe('/diary');
    });
  });

  describe('isPathAllowed', () => {
    it('matches a static allowed path', () => {
      expect(isPathAllowed('/profile', ['/diary', '/profile'])).toBe(true);
    });

    it('matches a dynamic path segment', () => {
      expect(isPathAllowed('/diary/entry-1', ['/diary/[id]'])).toBe(true);
    });

    it('rejects a path outside the allowed list', () => {
      expect(isPathAllowed('/cloud', ['/diary', '/profile'])).toBe(false);
    });
  });

  describe('isSamePath', () => {
    it('ignores trailing slashes', () => {
      expect(isSamePath('/diary/', '/diary')).toBe(true);
    });
  });
});

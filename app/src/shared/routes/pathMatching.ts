const createPathPattern = (allowedPath: string): RegExp => {
  const escapedPath = allowedPath
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[([^\]]+)\\\]/g, '[^/]+');

  return new RegExp(`^${escapedPath}$`);
};

export const normalizePath = (pathname: string): string => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const pathWithoutQuery = pathname.split('?')[0];

  return pathWithoutQuery.replace(/\/+$/, '') || '/';
};

export const isPathAllowed = (
  pathname: string,
  allowedPaths: readonly string[]
): boolean => {
  const normalizedPathname = normalizePath(pathname);

  return allowedPaths.some((allowedPath) => {
    const normalizedAllowedPath = normalizePath(allowedPath);
    const pattern = createPathPattern(normalizedAllowedPath);

    return pattern.test(normalizedPathname);
  });
};

export const isSamePath = (firstPath: string, secondPath: string): boolean => {
  return normalizePath(firstPath) === normalizePath(secondPath);
};

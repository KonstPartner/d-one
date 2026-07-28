export const normalizePath = (pathname: string) => {
  if (!pathname || pathname === '/') {
    return '/';
  }

  const pathWithoutQuery = pathname.split('?')[0];

  return pathWithoutQuery.replace(/\/+$/, '') || '/';
};

const createPathPattern = (allowedPath: string) => {
  const escapedPath = allowedPath
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\[([^\]]+)\\\]/g, '[^/]+');

  return new RegExp(`^${escapedPath}$`);
};

export const isPathAllowed = (
  pathname: string,
  allowedPaths: readonly string[]
) => {
  const normalizedPathname = normalizePath(pathname);

  return allowedPaths.some((allowedPath) => {
    const normalizedAllowedPath = normalizePath(allowedPath);
    const pattern = createPathPattern(normalizedAllowedPath);

    return pattern.test(normalizedPathname);
  });
};

export const isSamePath = (firstPath: string, secondPath: string) =>
  normalizePath(firstPath) === normalizePath(secondPath);

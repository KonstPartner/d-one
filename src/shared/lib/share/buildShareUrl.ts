type SearchParamsValue = string | string[] | undefined;

type BuildShareUrlParams = {
  baseUrl: string;
  pathname: string;
  searchParams?: Record<string, SearchParamsValue>;
  excludeSearchKeys?: string[];
};

const normalizeBaseUrl = (url: string) => {
  return url.replace(/\/+$/, '');
};

const normalizePathname = (pathname: string) => {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

export const buildShareUrl = ({
  baseUrl,
  pathname,
  searchParams,
  excludeSearchKeys = [],
}: BuildShareUrlParams) => {
  const url = `${normalizeBaseUrl(baseUrl)}${normalizePathname(pathname)}`;

  if (!searchParams) {
    return url;
  }

  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (excludeSearchKeys.includes(key)) {
      return;
    }
    if (typeof value === 'undefined') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));

      return;
    }

    params.set(key, value);
  });

  const queryString = params.toString();

  return queryString ? `${url}?${queryString}` : url;
};

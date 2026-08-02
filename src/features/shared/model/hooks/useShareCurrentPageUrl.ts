import { useCallback, useMemo } from 'react';
import { useLocalSearchParams, usePathname } from 'expo-router';

import { envConfig } from '../constants/environment';
import { buildShareUrl } from '../utils/buildShareUrl';

import useShareContent from './useShareContent';

type SearchParamsValue = string | string[] | undefined;

type SearchParams = Record<string, SearchParamsValue>;

type UseShareCurrentPageUrlParams = {
  pathname?: string;
  searchParams?: SearchParams;
  excludeSearchKeys?: string[];
  title?: string;
  message?: string;
};

const DEFAULT_EXCLUDE_SEARCH_KEYS = ['id'];

const useShareCurrentPageUrl = ({
  pathname: customPathname,
  searchParams: customSearchParams,
  excludeSearchKeys = DEFAULT_EXCLUDE_SEARCH_KEYS,
  title,
  message,
}: UseShareCurrentPageUrlParams = {}) => {
  const currentPathname = usePathname();
  const currentSearchParams = useLocalSearchParams();

  const pathname = customPathname ?? currentPathname;

  const searchParams = useMemo(() => {
    return (customSearchParams ?? currentSearchParams) as SearchParams;
  }, [customSearchParams, currentSearchParams]);

  const shareUrl = useMemo(() => {
    return buildShareUrl({
      baseUrl: envConfig.publicAppUrl ?? '',
      pathname,
      searchParams,
      excludeSearchKeys,
    });
  }, [pathname, searchParams, excludeSearchKeys]);

  const { isSharing, onShare: shareContent } = useShareContent({
    title,
    message,
    linkUrl: shareUrl,
  });

  const onShare = useCallback(async () => {
    await shareContent();
  }, [shareContent]);

  return {
    shareUrl,
    isSharing,
    onShare,
  };
};

export default useShareCurrentPageUrl;

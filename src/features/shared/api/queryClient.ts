import { QueryCache, QueryClient } from '@tanstack/react-query';

import { errorMapper, ErrorType } from '../model';
import { showNotification } from '../ui';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const errorType = query.meta?.errorType as ErrorType | undefined;

      if (!errorType) {
        return;
      }

      const message = errorMapper(error, errorType);
      showNotification('error', message);
    },
  }),
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

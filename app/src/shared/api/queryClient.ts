import { QueryCache, QueryClient } from '@tanstack/react-query';

import { errorMapper, type ErrorType } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      const errorType = query.meta?.errorType as ErrorType | undefined;

      if (!errorType) {
        return;
      }

      showNotification('error', errorMapper(error, errorType));
    },
  }),

  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

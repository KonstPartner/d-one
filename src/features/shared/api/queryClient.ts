import { QueryCache, QueryClient } from '@tanstack/react-query';

import { ErrorType } from '../model/types/error';
import { errorMapper } from '../model/utils/error';
import { showNotification } from '../ui/Notification';

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

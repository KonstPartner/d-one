import { useMutation } from '@tanstack/react-query';

import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

import { analyzeFood } from './analyzeFood';

export const useAnalyzeFoodMutation = () =>
  useMutation({
    mutationFn: analyzeFood,

    onError: (error: unknown) => {
      showNotification('error', errorMapper(error, 'api'));
    },

    retry: false,
  });

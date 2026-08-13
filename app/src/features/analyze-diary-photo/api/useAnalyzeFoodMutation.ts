import { useMutation } from '@tanstack/react-query';

import { analyzeFood } from './analyzeFood';

export const useAnalyzeFoodMutation = () =>
  useMutation({
    mutationFn: analyzeFood,

    networkMode: 'always',
    retry: false,
  });

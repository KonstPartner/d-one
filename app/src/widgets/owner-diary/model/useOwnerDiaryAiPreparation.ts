import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  formatAnalyzeFoodResult,
  useAnalyzeFoodMutation,
} from '@features/analyze-diary-photo';
import {
  type DiaryEntry,
  diaryLocalQueryKeys,
  useReadyDiaryDatabase,
} from '@entities/diary';
import { normalizeAppLanguage } from '@shared/i18n';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

export const useOwnerDiaryAiPreparation = () => {
  const queryClient = useQueryClient();

  const { t, i18n } = useTranslation();

  const { userId, repository } = useReadyDiaryDatabase();

  const analyzeFood = useAnalyzeFoodMutation();

  const refreshDiary = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({
      queryKey: diaryLocalQueryKeys.pagesRoot(userId),
    });
  }, [queryClient, userId]);

  const saveAnalysis = useCallback(
    async (entryId: string, aiAnalysis: string): Promise<void> => {
      await repository.updateAiAnalysis({
        id: entryId,
        aiAnalysis,
      });

      await refreshDiary();
    },
    [refreshDiary, repository]
  );

  const deleteAnalysis = useCallback(
    async (entryId: string): Promise<void> => {
      await saveAnalysis(entryId, '');
    },
    [saveAnalysis]
  );

  const analyzeEntry = useCallback(
    async (entry: DiaryEntry): Promise<string | null> => {
      if (entry.photoPath === null || entry.photoUrl === null) {
        return null;
      }

      try {
        const language = normalizeAppLanguage(
          i18n.resolvedLanguage ?? i18n.language
        );

        const result = await analyzeFood.mutateAsync({
          entryId: entry.id,

          photoPath: entry.photoPath,
          photoUrl: entry.photoUrl,

          comment: entry.comment,

          language,
        });

        if (result.status === 'not_food') {
          showNotification('warn', t('diaryAi.notFood'));

          return null;
        }

        if (result.status === 'insufficient_data') {
          showNotification('warn', t('diaryAi.insufficientData'));

          return null;
        }

        const aiAnalysis = formatAnalyzeFoodResult(result, language);

        await saveAnalysis(entry.id, aiAnalysis);

        return aiAnalysis;
      } catch (error) {
        console.error(`Failed to analyze diary photo: ${entry.id}`, error);

        showNotification('error', errorMapper(error, 'api'));

        return null;
      }
    },
    [
      analyzeFood.mutateAsync,
      i18n.language,
      i18n.resolvedLanguage,
      saveAnalysis,
      t,
    ]
  );

  return {
    analyzeEntry,
    deleteAnalysis,
  };
};

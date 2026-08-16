import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import {
  type DiaryCsvLocalization,
  type DiaryExportFormat,
  type DiaryExportScope,
  useDiaryExportMutation,
} from '@features/export-diary';
import { useSession } from '@entities/session';
import { userProfileQueryOptions } from '@entities/user';
import { normalizeAppLanguage } from '@shared/i18n';
import { errorMapper } from '@shared/lib/errors';
import { showNotification } from '@shared/lib/notifications';

type DiaryTransferExportInput = {
  format: DiaryExportFormat;

  scope: DiaryExportScope;
};

export const useDiaryTransferExport = () => {
  const { t, i18n } = useTranslation();

  const { sessionUser } = useSession();

  const userId = sessionUser?.uid ?? null;

  const profileQuery = useQuery(userProfileQueryOptions(userId));

  const userName = profileQuery.data?.nickname ?? '';

  const {
    exportDiary,

    isExporting,
    result,

    reset,
  } = useDiaryExportMutation();

  const buildCsvLocalization = useCallback(
    (): DiaryCsvLocalization => ({
      language: normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language),

      headers: {
        eventAt: t('transfer.export.csvHeaders.eventAt'),

        glucose: t('transfer.export.csvHeaders.glucose'),

        mealRelation: t('transfer.export.csvHeaders.mealRelation'),

        shortInsulin: t('transfer.export.csvHeaders.shortInsulin'),

        ultraShortInsulin: t('transfer.export.csvHeaders.ultraShortInsulin'),

        longInsulin: t('transfer.export.csvHeaders.longInsulin'),

        carbsGram: t('transfer.export.csvHeaders.carbsGram'),

        comment: t('transfer.export.csvHeaders.comment'),

        aiAnalysis: t('transfer.export.csvHeaders.aiAnalysis'),

        photoUrl: t('transfer.export.csvHeaders.photoUrl'),
      },

      mealRelations: {
        beforeMeal: t('diary.entry.mealRelation.beforeMeal'),

        afterMeal: t('diary.entry.mealRelation.afterMeal'),

        fasting: t('diary.entry.mealRelation.fasting'),

        bedtime: t('diary.entry.mealRelation.bedtime'),

        night: t('diary.entry.mealRelation.night'),
      },
    }),
    [i18n.language, i18n.resolvedLanguage, t]
  );

  const resetExport = useCallback((): void => {
    reset();
  }, [reset]);

  const startExport = useCallback(
    async ({ format, scope }: DiaryTransferExportInput) => {
      if (userName.length === 0) {
        return null;
      }

      resetExport();

      try {
        const exportResult =
          format === 'csv'
            ? await exportDiary({
                format: 'csv',

                userName,
                scope,

                localization: buildCsvLocalization(),
              })
            : await exportDiary({
                format,

                userName,
                scope,
              });

        if (exportResult === null) {
          showNotification(
            'error',
            errorMapper(new Error('DIARY_EXPORT_EMPTY'), 'transfer')
          );
        }

        return exportResult;
      } catch (error) {
        console.error('Failed to export diary', error);

        showNotification(
          'error',
          errorMapper(new Error('DIARY_EXPORT_FAILED'), 'transfer')
        );

        return null;
      }
    },
    [buildCsvLocalization, exportDiary, resetExport, t, userName]
  );

  return {
    canExport: userName.length > 0,

    isExporting,
    result,

    startExport,
    resetExport,
  };
};

import { useCallback, useState } from 'react';
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
    error,

    reset,
  } = useDiaryExportMutation();

  const [empty, setEmpty] = useState(false);

  const buildCsvLocalization = useCallback(
    (): DiaryCsvLocalization => ({
      language: normalizeAppLanguage(i18n.resolvedLanguage ?? i18n.language),

      headers: {
        eventAt: t('transfer.export.csvHeaders.eventAt'),

        glucose: t('transfer.export.csvHeaders.glucose'),

        mealRelation: t('transfer.export.csvHeaders.mealRelation'),

        shortInsulin: t('transfer.export.csvHeaders.shortInsulin'),

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
    setEmpty(false);

    reset();
  }, [reset]);

  const startExport = useCallback(
    async ({ format, scope }: DiaryTransferExportInput) => {
      if (userName.length === 0) {
        return null;
      }

      resetExport();

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
        setEmpty(true);
      }

      return exportResult;
    },
    [buildCsvLocalization, exportDiary, resetExport, userName]
  );

  return {
    canExport: userName.length > 0,

    isExporting,

    result,
    error,
    empty,

    startExport,
    resetExport,
  };
};

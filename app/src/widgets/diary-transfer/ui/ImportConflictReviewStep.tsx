import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { DiaryImportConflictDecision } from '@features/import-diary';
import {
  type DiaryBackupEntry,
  type DiaryEntry,
  DiaryEntryCard,
} from '@entities/diary';
import { Button, Pagination } from '@shared/ui';

import * as s from '../styles/DiaryTransferModal';

import { TransferStepHeader } from './TransferStepPrimitives';

type ImportConflictReviewItem = {
  entryId: string;

  localEntry: DiaryEntry;
  backupEntry: DiaryBackupEntry;

  backupPhotoUri: string | null;
};

type ImportConflictReviewStepProps = {
  items: readonly ImportConflictReviewItem[];

  resolvedCount: number;

  getDecision: (entryId: string) => DiaryImportConflictDecision | null;

  onSetDecision: (
    entryId: string,
    decision: DiaryImportConflictDecision
  ) => void;

  onBack: () => void;
  onContinue: () => void;
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
});

const createBackupDisplayEntry = ({
  localEntry,
  backupEntry,
  backupPhotoUri,
}: {
  localEntry: DiaryEntry;
  backupEntry: DiaryBackupEntry;
  backupPhotoUri: string | null;
}): DiaryEntry => ({
  id: backupEntry.id,
  userId: localEntry.userId,

  glucose: backupEntry.glucose,
  mealRelation: backupEntry.mealRelation,
  shortInsulin: backupEntry.shortInsulin,
  longInsulin: backupEntry.longInsulin,
  carbsGram: backupEntry.carbsGram,

  comment: backupEntry.comment,
  aiAnalysis: backupEntry.aiAnalysis,

  localPhotoUri: backupPhotoUri,

  photoPath: null,

  photoUrl: backupEntry.photoUrl,

  eventAt: new Date(backupEntry.eventAt),

  syncStatus: 'synced',
});

export const ImportConflictReviewStep = ({
  items,

  resolvedCount,

  getDecision,
  onSetDecision,

  onBack,
  onContinue,
}: ImportConflictReviewStepProps) => {
  const { t } = useTranslation();

  const [currentPage, setCurrentPage] = useState(1);

  const currentItem = items[currentPage - 1];

  const backupDisplayEntry = useMemo(
    () =>
      currentItem === undefined
        ? null
        : createBackupDisplayEntry({
            localEntry: currentItem.localEntry,

            backupEntry: currentItem.backupEntry,

            backupPhotoUri: currentItem.backupPhotoUri,
          }),
    [currentItem]
  );

  if (currentItem === undefined || backupDisplayEntry === null) {
    return null;
  }

  const decision = getDecision(currentItem.entryId);

  const allResolved = resolvedCount === items.length;

  return (
    <s.Screen>
      <TransferStepHeader
        title={t('transfer.import.review.title')}
        disabled={false}
        onBack={onBack}
      />

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <s.Options>
          <s.OptionContent>
            <s.OptionTitle>
              {t('transfer.import.review.counter', {
                current: currentPage,
                total: items.length,
              })}
            </s.OptionTitle>

            <s.OptionDescription>
              {t('transfer.import.review.resolved', {
                current: resolvedCount,
                total: items.length,
              })}
            </s.OptionDescription>
          </s.OptionContent>

          <s.OptionContent>
            <s.OptionTitle>
              {t('transfer.import.review.localTitle')}
            </s.OptionTitle>

            <s.OptionDescription>
              {t('transfer.import.review.localDescription')}
            </s.OptionDescription>
          </s.OptionContent>

          <DiaryEntryCard entry={currentItem.localEntry} isVisible readOnly />

          <s.OptionContent>
            <s.OptionTitle>
              {t('transfer.import.review.backupTitle')}
            </s.OptionTitle>

            <s.OptionDescription>
              {t('transfer.import.review.backupDescription')}
            </s.OptionDescription>
          </s.OptionContent>

          <DiaryEntryCard entry={backupDisplayEntry} isVisible readOnly />

          <Button
            tone={decision === 'skip' ? 'primary' : 'input'}
            accessibilityState={{
              selected: decision === 'skip',
            }}
            onPress={() => {
              onSetDecision(currentItem.entryId, 'skip');
            }}
          >
            {t('transfer.import.review.skip')}
          </Button>

          <Button
            tone={decision === 'replace' ? 'primary' : 'input'}
            accessibilityState={{
              selected: decision === 'replace',
            }}
            onPress={() => {
              onSetDecision(currentItem.entryId, 'replace');
            }}
          >
            {t('transfer.import.review.replace')}
          </Button>

          <Pagination
            currentPage={currentPage}
            totalPages={items.length}
            previousPageAccessibilityLabel={t(
              'transfer.import.review.previous'
            )}
            nextPageAccessibilityLabel={t('transfer.import.review.next')}
            onChangePage={setCurrentPage}
          />

          <s.OptionContent>
            <s.OptionDescription>
              {t(
                allResolved
                  ? 'transfer.import.review.ready'
                  : 'transfer.import.review.remaining',
                {
                  count: items.length - resolvedCount,
                }
              )}
            </s.OptionDescription>
          </s.OptionContent>

          <Button tone="primary" disabled={!allResolved} onPress={onContinue}>
            {t('transfer.import.review.continueImport')}
          </Button>
        </s.Options>
      </ScrollView>
    </s.Screen>
  );
};

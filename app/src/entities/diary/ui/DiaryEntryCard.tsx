import { memo, useCallback } from 'react';

import type { DiaryEntry } from '../model/diaryEntry';
import { useDiaryEntryCard } from '../model/useDiaryEntryCard';

import { DiaryEntryCardBody, DiaryEntryCardShell } from './DiaryEntryCardShell';
import { DiaryEntryMeta } from './DiaryEntryMeta';
import { DiaryEntryMetrics } from './DiaryEntryMetrics';
import { DiaryEntryPhoto } from './DiaryEntryPhoto';
import { DiaryEntrySyncStatus } from './DiaryEntrySyncStatus';
import { DiaryEntryTextSections } from './DiaryEntryTextSections';

type DiaryEntryCardProps = {
  entry: DiaryEntry;

  isVisible?: boolean;
  synchronizing?: boolean;

  readOnly?: boolean;

  selectionActive?: boolean;
  selected?: boolean;

  onToggleSelection?: (entry: DiaryEntry) => void;

  onPress?: (entry: DiaryEntry) => void;

  onOpenPhoto?: (entry: DiaryEntry) => void;
};

const DiaryEntryCardComponent = ({
  entry,

  isVisible = false,
  synchronizing = false,

  readOnly = false,

  selectionActive = false,
  selected = false,

  onToggleSelection,

  onPress,
  onOpenPhoto,
}: DiaryEntryCardProps) => {
  const {
    editAccessibilityLabel,

    pendingDelete,
    actionsDisabled,

    photoInteractive,

    handleCardPress,
    handlePhotoPress,
  } = useDiaryEntryCard({
    entry,
    synchronizing,
    onPress,
    onOpenPhoto,
  });

  const hasPhoto = entry.localPhotoUri !== null || entry.photoUrl !== null;

  const effectiveActionsDisabled = readOnly ? false : actionsDisabled;

  const effectivePhotoInteractive = readOnly
    ? hasPhoto && onOpenPhoto !== undefined
    : photoInteractive;

  const handleReadOnlyPhotoPress = useCallback(() => {
    if (!readOnly || !effectivePhotoInteractive) {
      return;
    }

    onOpenPhoto?.(entry);
  }, [effectivePhotoInteractive, entry, onOpenPhoto, readOnly]);

  const handleToggleSelection = useCallback(() => {
    if (!selectionActive || effectiveActionsDisabled) {
      return;
    }

    onToggleSelection?.(entry);
  }, [effectiveActionsDisabled, entry, onToggleSelection, selectionActive]);

  return (
    <DiaryEntryCardShell
      testID={`diary-entry-card-${entry.id}`}
      disabled={effectiveActionsDisabled}
      dimmed={readOnly ? false : pendingDelete}
      selectionActive={selectionActive}
      selectionDisabled={effectiveActionsDisabled}
      selected={selected}
      accessibilityLabel={editAccessibilityLabel}
      onPress={
        !readOnly && !selectionActive && onPress !== undefined
          ? handleCardPress
          : undefined
      }
      onToggleSelection={selectionActive ? handleToggleSelection : undefined}
    >
      <DiaryEntryPhoto
        entryId={entry.id}
        localPhotoUri={entry.localPhotoUri}
        photoUrl={entry.photoUrl}
        isVisible={isVisible}
        disabled={selectionActive || effectiveActionsDisabled}
        onPress={
          !selectionActive && effectivePhotoInteractive
            ? readOnly
              ? handleReadOnlyPhotoPress
              : handlePhotoPress
            : undefined
        }
      />

      <DiaryEntryCardBody selectionActive={selectionActive}>
        <DiaryEntryMeta
          eventAt={entry.eventAt}
          mealRelation={entry.mealRelation}
        />

        <DiaryEntryMetrics
          glucose={entry.glucose}
          carbsGram={entry.carbsGram}
          shortInsulin={entry.shortInsulin}
          ultraShortInsulin={entry.ultraShortInsulin}
          longInsulin={entry.longInsulin}
        />

        <DiaryEntryTextSections
          comment={entry.comment}
          aiAnalysis={entry.aiAnalysis}
          disabled={selectionActive || effectiveActionsDisabled}
        />

        <DiaryEntrySyncStatus
          syncStatus={entry.syncStatus}
          synchronizing={synchronizing}
        />
      </DiaryEntryCardBody>
    </DiaryEntryCardShell>
  );
};

export const DiaryEntryCard = memo(DiaryEntryCardComponent);

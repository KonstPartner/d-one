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

  const handleToggleSelection = useCallback(() => {
    if (!selectionActive || actionsDisabled) {
      return;
    }

    onToggleSelection?.(entry);
  }, [actionsDisabled, entry, onToggleSelection, selectionActive]);

  return (
    <DiaryEntryCardShell
      testID={`diary-entry-card-${entry.id}`}
      disabled={actionsDisabled}
      dimmed={pendingDelete}
      selectionActive={selectionActive}
      selectionDisabled={actionsDisabled}
      selected={selected}
      accessibilityLabel={editAccessibilityLabel}
      onPress={
        !selectionActive && onPress !== undefined ? handleCardPress : undefined
      }
      onToggleSelection={selectionActive ? handleToggleSelection : undefined}
    >
      <DiaryEntryPhoto
        entryId={entry.id}
        localPhotoUri={entry.localPhotoUri}
        photoUrl={entry.photoUrl}
        isVisible={isVisible}
        disabled={actionsDisabled || selectionActive}
        onPress={
          !selectionActive && photoInteractive ? handlePhotoPress : undefined
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
          longInsulin={entry.longInsulin}
        />

        <DiaryEntryTextSections
          comment={entry.comment}
          aiAnalysis={entry.aiAnalysis}
          disabled={actionsDisabled || selectionActive}
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

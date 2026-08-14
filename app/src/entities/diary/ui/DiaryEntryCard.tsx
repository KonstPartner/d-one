import { memo } from 'react';

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

  onPress?: (entry: DiaryEntry) => void;

  onOpenPhoto?: (entry: DiaryEntry) => void;
};

const DiaryEntryCardComponent = ({
  entry,

  isVisible = false,
  synchronizing = false,

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

  return (
    <DiaryEntryCardShell
      testID={`diary-entry-card-${entry.id}`}
      disabled={actionsDisabled}
      dimmed={pendingDelete}
      accessibilityLabel={
        onPress !== undefined ? editAccessibilityLabel : undefined
      }
      onPress={onPress !== undefined ? handleCardPress : undefined}
    >
      <DiaryEntryPhoto
        entryId={entry.id}
        localPhotoUri={entry.localPhotoUri}
        photoUrl={entry.photoUrl}
        isVisible={isVisible}
        disabled={actionsDisabled}
        onPress={photoInteractive ? handlePhotoPress : undefined}
      />

      <DiaryEntryCardBody>
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
          disabled={actionsDisabled}
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

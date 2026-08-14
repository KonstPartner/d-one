import { memo, useCallback } from 'react';

import type { CloudDiaryEntry } from '../model/cloudDiaryEntry';

import { CloudDiaryEntryPhoto } from './CloudDiaryEntryPhoto';
import { DiaryEntryCardBody, DiaryEntryCardShell } from './DiaryEntryCardShell';
import { DiaryEntryMeta } from './DiaryEntryMeta';
import { DiaryEntryMetrics } from './DiaryEntryMetrics';
import { DiaryEntryTextSections } from './DiaryEntryTextSections';

type CloudDiaryEntryCardProps = {
  entry: CloudDiaryEntry;

  isVisible?: boolean;

  selectionActive?: boolean;
  selected?: boolean;

  onToggleSelection?: (entry: CloudDiaryEntry) => void;

  onOpenPhoto?: (entry: CloudDiaryEntry) => void;
};

const CloudDiaryEntryCardComponent = ({
  entry,

  isVisible = false,

  selectionActive = false,
  selected = false,

  onToggleSelection,

  onOpenPhoto,
}: CloudDiaryEntryCardProps) => {
  const photoInteractive =
    !selectionActive && entry.photoUrl !== null && onOpenPhoto !== undefined;

  const handleToggleSelection = useCallback(() => {
    if (selectionActive) {
      onToggleSelection?.(entry);
    }
  }, [entry, onToggleSelection, selectionActive]);

  const handlePhotoPress = useCallback(() => {
    if (photoInteractive) {
      onOpenPhoto?.(entry);
    }
  }, [entry, onOpenPhoto, photoInteractive]);

  return (
    <DiaryEntryCardShell
      testID={`cloud-diary-entry-card-${entry.id}`}
      selected={selected}
      onPress={selectionActive ? handleToggleSelection : undefined}
    >
      <CloudDiaryEntryPhoto
        entryId={entry.id}
        photoUrl={entry.photoUrl}
        isVisible={isVisible}
        disabled={selectionActive}
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
          disabled={selectionActive}
        />
      </DiaryEntryCardBody>
    </DiaryEntryCardShell>
  );
};

export const CloudDiaryEntryCard = memo(CloudDiaryEntryCardComponent);

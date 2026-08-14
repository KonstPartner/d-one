import { useCallback, useState } from 'react';

import { DiaryTextModal } from './DiaryTextModal';
import { DiaryTextPreview } from './DiaryTextPreview';

type DiaryTextKey = 'comment' | 'aiAnalysis';

type DiaryEntryTextSectionsProps = {
  comment: string;
  commentTitle: string;

  aiAnalysis: string;
  aiAnalysisTitle: string;

  disabled?: boolean;
};

export const DiaryEntryTextSections = ({
  comment,
  commentTitle,

  aiAnalysis,
  aiAnalysisTitle,

  disabled = false,
}: DiaryEntryTextSectionsProps) => {
  const [openedTextKey, setOpenedTextKey] = useState<DiaryTextKey | null>(null);

  const normalizedComment = comment.trim();
  const normalizedAiAnalysis = aiAnalysis.trim();

  const handleOpenComment = useCallback(() => {
    if (!disabled) {
      setOpenedTextKey('comment');
    }
  }, [disabled]);

  const handleOpenAiAnalysis = useCallback(() => {
    if (!disabled) {
      setOpenedTextKey('aiAnalysis');
    }
  }, [disabled]);

  const handleCloseText = useCallback(() => {
    setOpenedTextKey(null);
  }, []);

  const openedText =
    openedTextKey === 'comment'
      ? {
          title: commentTitle,
          text: normalizedComment,
        }
      : openedTextKey === 'aiAnalysis'
        ? {
            title: aiAnalysisTitle,
            text: normalizedAiAnalysis,
          }
        : null;

  return (
    <>
      {normalizedComment.length > 0 && (
        <DiaryTextPreview
          variant="comment"
          title={commentTitle}
          text={normalizedComment}
          disabled={disabled}
          onOpen={handleOpenComment}
        />
      )}

      {normalizedAiAnalysis.length > 0 && (
        <DiaryTextPreview
          variant="aiAnalysis"
          title={aiAnalysisTitle}
          text={normalizedAiAnalysis}
          disabled={disabled}
          onOpen={handleOpenAiAnalysis}
        />
      )}

      <DiaryTextModal
        visible={openedText !== null}
        title={openedText?.title ?? ''}
        text={openedText?.text ?? ''}
        onClose={handleCloseText}
      />
    </>
  );
};

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { Button } from '@shared/ui';

import {
  type DiaryExportFileTarget,
  saveDiaryExportFile,
  shareDiaryExportFile,
} from '../api/diaryExportShareService';
import * as s from '../styles/ExportFileActionsScreen';

type ExportFileActionsProps = {
  file: DiaryExportFileTarget;

  onBusyChange?: (busy: boolean) => void;
};

export const ExportFileActions = ({
  file,
  onBusyChange,
}: ExportFileActionsProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const [fileAction, setFileAction] = useState<'save' | 'share' | null>(null);

  const [fileActionError, setFileActionError] = useState(false);

  const [saveSucceeded, setSaveSucceeded] = useState(false);

  const fileActionInProgressRef = useRef(false);

  const saveFeedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const clearSaveFeedbackTimer = useCallback(() => {
    if (saveFeedbackTimerRef.current === null) {
      return;
    }

    clearTimeout(saveFeedbackTimerRef.current);

    saveFeedbackTimerRef.current = null;
  }, []);

  useEffect(
    () => () => {
      clearSaveFeedbackTimer();
    },
    [clearSaveFeedbackTimer]
  );

  useEffect(() => {
    onBusyChange?.(fileAction !== null);
  }, [fileAction, onBusyChange]);

  const saveFile = useCallback(async (): Promise<void> => {
    if (fileActionInProgressRef.current) {
      return;
    }

    fileActionInProgressRef.current = true;

    clearSaveFeedbackTimer();
    setSaveSucceeded(false);
    setFileAction('save');
    setFileActionError(false);

    try {
      const saved = await saveDiaryExportFile(file);

      if (saved) {
        setSaveSucceeded(true);

        saveFeedbackTimerRef.current = setTimeout(() => {
          saveFeedbackTimerRef.current = null;

          setSaveSucceeded(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to save diary export file', error);

      setFileActionError(true);
    } finally {
      fileActionInProgressRef.current = false;

      setFileAction(null);
    }
  }, [clearSaveFeedbackTimer, file]);

  const shareFile = useCallback(async (): Promise<void> => {
    if (fileActionInProgressRef.current) {
      return;
    }

    fileActionInProgressRef.current = true;

    setFileAction('share');
    setFileActionError(false);

    try {
      await shareDiaryExportFile(file);
    } catch (error) {
      console.error('Failed to share diary export file', error);

      setFileActionError(true);
    } finally {
      fileActionInProgressRef.current = false;

      setFileAction(null);
    }
  }, [file]);

  return (
    <>
      {fileActionError && (
        <s.ErrorText>{t('common.errors.unknown')}</s.ErrorText>
      )}

      <s.FileActions>
        <Button
          tone="input"
          spinnerColor="primary"
          loading={fileAction === 'save'}
          disabled={fileAction !== null || saveSucceeded}
          style={s.fileActionButtonStyle}
          onPress={() => {
            void saveFile();
          }}
        >
          <s.FileActionContent>
            <Ionicons
              name={saveSucceeded ? 'checkmark' : 'download-outline'}
              size={20}
              color={saveSucceeded ? theme.colors.success : theme.colors.text}
            />

            <s.FileActionText>
              {t(
                saveSucceeded
                  ? 'transfer.export.result.saved'
                  : 'diary.form.save'
              )}
            </s.FileActionText>
          </s.FileActionContent>
        </Button>

        <Button
          tone="input"
          spinnerColor="primary"
          loading={fileAction === 'share'}
          disabled={fileAction !== null}
          style={s.fileActionButtonStyle}
          onPress={() => {
            void shareFile();
          }}
        >
          <s.FileActionContent>
            <Ionicons
              name="share-outline"
              size={20}
              color={theme.colors.text}
            />

            <s.FileActionText>{t('common.send')}</s.FileActionText>
          </s.FileActionContent>
        </Button>
      </s.FileActions>
    </>
  );
};

type ExportFileActionsScreenProps = {
  file: DiaryExportFileTarget;

  entriesCount?: number;
  photosCount?: number;
  skippedPhotosCount?: number;

  onBack: () => void;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;

  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(kilobytes >= 10 ? 0 : 1)} KB`;
  }

  const megabytes = kilobytes / 1024;

  return `${megabytes.toFixed(megabytes >= 10 ? 0 : 1)} MB`;
};

export const ExportFileActionsScreen = ({
  file,

  entriesCount,
  photosCount,
  skippedPhotosCount,

  onBack,
}: ExportFileActionsScreenProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const [actionsBusy, setActionsBusy] = useState(false);

  return (
    <s.Screen>
      <s.Content>
        <s.ResultHeader>
          <s.SuccessIcon>
            <Ionicons name="checkmark" size={36} color={theme.colors.success} />
          </s.SuccessIcon>

          <s.Title>{t('transfer.export.result.title')}</s.Title>

          <s.Description>
            {t('transfer.export.result.description')}
          </s.Description>

          <s.FileName numberOfLines={2} ellipsizeMode="middle">
            {file.fileName}
          </s.FileName>
        </s.ResultHeader>

        <s.StatsGrid>
          {entriesCount !== undefined && (
            <s.StatCard>
              <s.StatValue>{entriesCount}</s.StatValue>

              <s.StatLabel>{t('transfer.export.result.entries')}</s.StatLabel>
            </s.StatCard>
          )}

          {photosCount !== undefined && (
            <s.StatCard>
              <s.StatValue>{photosCount}</s.StatValue>

              <s.StatLabel>{t('transfer.export.result.photos')}</s.StatLabel>
            </s.StatCard>
          )}

          {skippedPhotosCount !== undefined && skippedPhotosCount > 0 && (
            <s.StatCard>
              <s.StatValue>{skippedPhotosCount}</s.StatValue>

              <s.StatLabel>
                {t('transfer.export.result.photosNotAdded')}
              </s.StatLabel>
            </s.StatCard>
          )}

          <s.StatCard>
            <s.StatValue>{formatFileSize(file.fileSize)}</s.StatValue>

            <s.StatLabel>{t('transfer.export.result.fileSize')}</s.StatLabel>
          </s.StatCard>
        </s.StatsGrid>

        <ExportFileActions file={file} onBusyChange={setActionsBusy} />
      </s.Content>

      <s.Footer>
        <Button tone="primary" disabled={actionsBusy} onPress={onBack}>
          <s.DoneText>{t('transfer.export.result.done')}</s.DoneText>
        </Button>
      </s.Footer>
    </s.Screen>
  );
};

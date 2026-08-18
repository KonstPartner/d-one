import { Modal } from 'react-native';
import { useTranslation } from 'react-i18next';

import * as s from '../styles/DiaryTextModal';

type DiaryTextModalProps = {
  visible: boolean;

  title: string;
  text: string;

  onClose: () => void;
};

const formatLegacyAiAnalysis = (
  text: string,
  statusLabels: ReadonlySet<string>
): string => {
  if (text.includes('\n\n')) {
    return text;
  }

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) {
    return text;
  }

  const details: string[] = [];

  if (statusLabels.has(lines[0])) {
    const status = lines.shift();

    if (status !== undefined) {
      details.push(status);
    }
  }

  const description = lines.shift();

  if (description === undefined) {
    return text;
  }

  const metrics = lines.splice(0, Math.min(4, lines.length));

  details.push(...lines);

  return [description, metrics.join('\n'), details.join('\n')]
    .filter((block) => block.length > 0)
    .join('\n\n');
};

const formatAiAssumptions = (text: string): string => {
  const blocks = text.split('\n\n');

  if (blocks.length < 3) {
    return text;
  }

  const detailsIndex = blocks.length - 1;

  const details = blocks[detailsIndex]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (details.length < 3) {
    return text;
  }

  const assumptionsLine = details[2];
  const separatorIndex = assumptionsLine.indexOf(':');

  if (separatorIndex < 0) {
    return text;
  }

  const label = assumptionsLine.slice(0, separatorIndex + 1).trim();
  const rawAssumptions = assumptionsLine.slice(separatorIndex + 1).trim();

  const assumptions = rawAssumptions
    .split(';')
    .map((assumption) => assumption.trim())
    .filter((assumption) => assumption.length > 0);

  if (assumptions.length === 0) {
    return text;
  }

  details.splice(
    2,
    1,
    label,
    ...assumptions.map((assumption, index) => `${index + 1}. ${assumption}`)
  );

  blocks[detailsIndex] = details.join('\n');

  return blocks.join('\n\n');
};

export const DiaryTextModal = ({
  visible,

  title,
  text,

  onClose,
}: DiaryTextModalProps) => {
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  const isAiAnalysis = title === t('diary.entry.aiAnalysis');

  const displayedText = isAiAnalysis
    ? formatAiAssumptions(
        formatLegacyAiAnalysis(
          text,
          new Set([t('diaryAi.result.ok'), t('diaryAi.result.partial')])
        )
      )
    : text;

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <s.Root>
        <s.Backdrop accessible={false} onPress={onClose} />

        <s.Sheet
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          edges={['bottom']}
        >
          <s.Header>
            <s.Title numberOfLines={1}>{title}</s.Title>
          </s.Header>

          <s.Body showsVerticalScrollIndicator>
            <s.BodyContent>
              <s.BodyText selectable>{displayedText}</s.BodyText>
            </s.BodyContent>
          </s.Body>

          <s.Footer>
            <s.FooterButton tone="primary" onPress={onClose}>
              <s.FooterButtonText>{t('common.close')}</s.FooterButtonText>
            </s.FooterButton>
          </s.Footer>
        </s.Sheet>
      </s.Root>
    </Modal>
  );
};

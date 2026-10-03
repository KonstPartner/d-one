import { useTranslation } from 'react-i18next';

import { IconButton, PortalModal } from '@shared/ui';

import type { AppRelease } from '../model/types';
import * as s from '../styles/VersionHistory';

import { VersionDetails } from './VersionDetails';
import { VersionGraph } from './VersionGraph';

type VersionHistoryModalProps = {
  visible: boolean;
  releases: readonly AppRelease[];
  currentVersion: string;
  selectedRelease: AppRelease | null;
  onClose: () => void;
  onBack: () => void;
  onVersionPress: (version: string) => void;
};

export const VersionHistoryModal = ({
  visible,
  releases,
  currentVersion,
  selectedRelease,
  onClose,
  onBack,
  onVersionPress,
}: VersionHistoryModalProps) => {
  const { t } = useTranslation();

  return (
    <PortalModal
      visible={visible}
      onClose={onClose}
      withoutScroll
      withoutCloseBtn
    >
      <s.ModalRoot>
        <s.ModalHeader>
          {selectedRelease !== null && (
            <IconButton
              icon="chevron-back"
              tone="input"
              accessibilityLabel={t('versionHistory.back')}
              onPress={onBack}
            />
          )}

          <s.ModalHeaderCopy>
            <s.ModalTitle>{t('versionHistory.title')}</s.ModalTitle>

            <s.ModalSubtitle>
              {t(
                selectedRelease === null
                  ? 'versionHistory.graphSubtitle'
                  : 'versionHistory.detailsSubtitle'
              )}
            </s.ModalSubtitle>
          </s.ModalHeaderCopy>

          <IconButton
            icon="close"
            tone="input"
            accessibilityLabel={t('common.close')}
            onPress={onClose}
          />
        </s.ModalHeader>

        <s.ModalScroll
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.modalScrollContentStyle}
        >
          {selectedRelease === null ? (
            <VersionGraph
              releases={releases}
              currentVersion={currentVersion}
              onVersionPress={onVersionPress}
            />
          ) : (
            <VersionDetails
              release={selectedRelease}
              current={selectedRelease.version === currentVersion}
            />
          )}
        </s.ModalScroll>
      </s.ModalRoot>
    </PortalModal>
  );
};

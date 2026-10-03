import { useState } from 'react';

import { APP_RELEASES, CURRENT_APP_VERSION } from '../model/releases';

import { VersionHistoryButton } from './VersionHistoryButton';
import { VersionHistoryModal } from './VersionHistoryModal';

export const AppVersionHistory = () => {
  const [visible, setVisible] = useState(false);

  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);

  const selectedRelease =
    selectedVersion === null
      ? null
      : (APP_RELEASES.find((release) => release.version === selectedVersion) ??
        null);

  const handleOpen = (): void => {
    setSelectedVersion(null);
    setVisible(true);
  };

  const handleClose = (): void => {
    setVisible(false);
    setSelectedVersion(null);
  };

  return (
    <>
      <VersionHistoryButton
        version={CURRENT_APP_VERSION}
        onPress={handleOpen}
      />

      <VersionHistoryModal
        visible={visible}
        releases={APP_RELEASES}
        currentVersion={CURRENT_APP_VERSION}
        selectedRelease={selectedRelease}
        onClose={handleClose}
        onBack={() => {
          setSelectedVersion(null);
        }}
        onVersionPress={setSelectedVersion}
      />
    </>
  );
};

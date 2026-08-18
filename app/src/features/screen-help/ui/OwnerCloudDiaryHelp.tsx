import { useCallback, useMemo, useState } from 'react';

import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';

import { ScreenHelpModal, type ScreenHelpSection } from './ScreenHelpModal';

const OWNER_CLOUD_DIARY_HELP_SECTIONS: readonly ScreenHelpSection[] = [
  {
    key: 'about',
    titleKey: 'screenHelp.ownerCloudDiary.about.title',
    descriptionKey: 'screenHelp.ownerCloudDiary.about.description',
    bulletKeys: [
      'screenHelp.ownerCloudDiary.about.syncedOnly',
      'screenHelp.ownerCloudDiary.about.editInDiary',
      'screenHelp.ownerCloudDiary.about.afterSync',
    ],
  },
  {
    key: 'viewing',
    titleKey: 'screenHelp.ownerCloudDiary.viewing.title',
    bulletKeys: [
      'screenHelp.ownerCloudDiary.viewing.photo',
      'screenHelp.ownerCloudDiary.viewing.pages',
      'screenHelp.ownerCloudDiary.viewing.refresh',
    ],
  },
  {
    key: 'download',
    titleKey: 'screenHelp.ownerCloudDiary.download.title',
    descriptionKey: 'screenHelp.ownerCloudDiary.download.description',
    bulletKeys: [
      'screenHelp.ownerCloudDiary.download.select',
      'screenHelp.ownerCloudDiary.download.choose',
      'screenHelp.ownerCloudDiary.download.start',
    ],
  },
  {
    key: 'conflicts',
    titleKey: 'screenHelp.ownerCloudDiary.conflicts.title',
    descriptionKey: 'screenHelp.ownerCloudDiary.conflicts.description',
    bulletKeys: [
      'screenHelp.ownerCloudDiary.conflicts.skip',
      'screenHelp.ownerCloudDiary.conflicts.replace',
      'screenHelp.ownerCloudDiary.conflicts.review',
    ],
  },
  {
    key: 'result',
    titleKey: 'screenHelp.ownerCloudDiary.result.title',
    bulletKeys: [
      'screenHelp.ownerCloudDiary.result.local',
      'screenHelp.ownerCloudDiary.result.noAutomaticUpload',
      'screenHelp.ownerCloudDiary.result.summary',
    ],
  },
];

type OwnerCloudDiaryHelpProps = {
  menuEnabled?: boolean;
};

export const OwnerCloudDiaryHelp = ({
  menuEnabled = true,
}: OwnerCloudDiaryHelpProps) => {
  const [visible, setVisible] = useState(false);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const menuItems = useMemo<HeaderMenuItem[]>(
    () =>
      menuEnabled
        ? [
            {
              key: 'owner-cloud-diary-help',
              labelKey: 'screenHelp.menuLabel',
              icon: 'help-circle-outline',
              onPress: handleOpen,
              placement: 'bottom',
            },
          ]
        : [],
    [handleOpen, menuEnabled]
  );

  useHeaderMenu(menuItems);

  return (
    <ScreenHelpModal
      visible={visible}
      titleKey="screenHelp.ownerCloudDiary.title"
      introKey="screenHelp.ownerCloudDiary.intro"
      sections={OWNER_CLOUD_DIARY_HELP_SECTIONS}
      onClose={handleClose}
    />
  );
};

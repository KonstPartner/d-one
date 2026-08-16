import { useCallback, useMemo, useState } from 'react';

import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';

import { ScreenHelpModal, type ScreenHelpSection } from './ScreenHelpModal';

const FOLLOWER_DIARY_HELP_SECTIONS: readonly ScreenHelpSection[] = [
  {
    key: 'about',
    titleKey: 'screenHelp.followerDiary.about.title',
    descriptionKey: 'screenHelp.followerDiary.about.description',
    bulletKeys: [
      'screenHelp.followerDiary.about.readOnly',
      'screenHelp.followerDiary.about.cloudData',
      'screenHelp.followerDiary.about.syncDelay',
    ],
  },
  {
    key: 'viewing',
    titleKey: 'screenHelp.followerDiary.viewing.title',
    bulletKeys: [
      'screenHelp.followerDiary.viewing.entries',
      'screenHelp.followerDiary.viewing.photo',
      'screenHelp.followerDiary.viewing.pages',
    ],
  },
  {
    key: 'refresh',
    titleKey: 'screenHelp.followerDiary.refresh.title',
    descriptionKey: 'screenHelp.followerDiary.refresh.description',
    bulletKeys: [
      'screenHelp.followerDiary.refresh.action',
      'screenHelp.followerDiary.refresh.latest',
    ],
  },
  {
    key: 'unassigned',
    titleKey: 'screenHelp.followerDiary.unassigned.title',
    descriptionKey: 'screenHelp.followerDiary.unassigned.description',
    bulletKeys: [
      'screenHelp.followerDiary.unassigned.noDiary',
      'screenHelp.followerDiary.unassigned.refresh',
    ],
  },
];

export const FollowerDiaryHelp = () => {
  const [visible, setVisible] = useState(false);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  const menuItems = useMemo<HeaderMenuItem[]>(
    () => [
      {
        key: 'follower-diary-help',
        labelKey: 'screenHelp.menuLabel',
        icon: 'help-circle-outline',
        onPress: handleOpen,
      },
    ],
    [handleOpen]
  );

  useHeaderMenu(menuItems);

  return (
    <ScreenHelpModal
      visible={visible}
      titleKey="screenHelp.followerDiary.title"
      introKey="screenHelp.followerDiary.intro"
      sections={FOLLOWER_DIARY_HELP_SECTIONS}
      onClose={handleClose}
    />
  );
};

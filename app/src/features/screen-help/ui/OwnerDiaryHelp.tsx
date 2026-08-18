import { useCallback, useMemo, useState } from 'react';

import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';

import { ScreenHelpModal, type ScreenHelpSection } from './ScreenHelpModal';

const OWNER_DIARY_HELP_SECTIONS: readonly ScreenHelpSection[] = [
  {
    key: 'entries',
    titleKey: 'screenHelp.ownerDiary.entries.title',
    descriptionKey: 'screenHelp.ownerDiary.entries.description',
    bulletKeys: [
      'screenHelp.ownerDiary.entries.create',
      'screenHelp.ownerDiary.entries.edit',
      'screenHelp.ownerDiary.entries.photo',
    ],
  },
  {
    key: 'search',
    titleKey: 'screenHelp.ownerDiary.search.title',
    descriptionKey: 'screenHelp.ownerDiary.search.description',
    bulletKeys: [
      'screenHelp.ownerDiary.search.field',
      'screenHelp.ownerDiary.search.input',
      'screenHelp.ownerDiary.search.filters',
    ],
  },
  {
    key: 'organization',
    titleKey: 'screenHelp.ownerDiary.organization.title',
    bulletKeys: [
      'screenHelp.ownerDiary.organization.day',
      'screenHelp.ownerDiary.organization.allDays',
      'screenHelp.ownerDiary.organization.pages',
    ],
  },
  {
    key: 'selection',
    titleKey: 'screenHelp.ownerDiary.selection.title',
    descriptionKey: 'screenHelp.ownerDiary.selection.description',
    bulletKeys: [
      'screenHelp.ownerDiary.selection.open',
      'screenHelp.ownerDiary.selection.actions',
    ],
  },
  {
    key: 'sync',
    titleKey: 'screenHelp.ownerDiary.sync.title',
    descriptionKey: 'screenHelp.ownerDiary.sync.description',
    bulletKeys: [
      'screenHelp.ownerDiary.sync.status',
      'screenHelp.ownerDiary.sync.manual',
    ],
  },
  {
    key: 'photoAi',
    titleKey: 'screenHelp.ownerDiary.photoAi.title',
    bulletKeys: [
      'screenHelp.ownerDiary.photoAi.photo',
      'screenHelp.ownerDiary.photoAi.redaction',
      'screenHelp.ownerDiary.photoAi.ai',
      'screenHelp.ownerDiary.photoAi.timer',
    ],
  },
];

type OwnerDiaryHelpProps = {
  menuEnabled?: boolean;
};

export const OwnerDiaryHelp = ({ menuEnabled = true }: OwnerDiaryHelpProps) => {
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
              key: 'owner-diary-help',
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
      titleKey="screenHelp.ownerDiary.title"
      introKey="screenHelp.ownerDiary.intro"
      sections={OWNER_DIARY_HELP_SECTIONS}
      onClose={handleClose}
    />
  );
};

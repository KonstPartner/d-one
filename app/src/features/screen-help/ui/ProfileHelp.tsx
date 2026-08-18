import { useCallback, useMemo, useState } from 'react';

import { UserRole } from '@entities/user';
import { type HeaderMenuItem, useHeaderMenu } from '@shared/lib/navigation';

import { ScreenHelpModal, type ScreenHelpSection } from './ScreenHelpModal';

const PROFILE_HELP_SECTIONS: readonly ScreenHelpSection[] = [
  {
    key: 'profile',
    titleKey: 'screenHelp.profile.account.title',
    descriptionKey: 'screenHelp.profile.account.description',
    bulletKeys: [
      'screenHelp.profile.account.nickname',
      'screenHelp.profile.account.email',
      'screenHelp.profile.account.role',
    ],
  },
  {
    key: 'security',
    titleKey: 'screenHelp.profile.security.title',
    bulletKeys: [
      'screenHelp.profile.security.changeEmail',
      'screenHelp.profile.security.changePassword',
      'screenHelp.profile.security.logout',
    ],
  },
];

const USER_TRANSFER_HELP_SECTIONS: readonly ScreenHelpSection[] = [
  {
    key: 'transfer',
    titleKey: 'screenHelp.profile.transfer.title',
    descriptionKey: 'screenHelp.profile.transfer.description',
    bulletKeys: [
      'screenHelp.profile.transfer.open',
      'screenHelp.profile.transfer.localData',
    ],
  },
  {
    key: 'exportFormats',
    titleKey: 'screenHelp.profile.exportFormats.title',
    descriptionKey: 'screenHelp.profile.exportFormats.description',
    bulletKeys: [
      'screenHelp.profile.exportFormats.fullBackup',
      'screenHelp.profile.exportFormats.lightweightBackup',
      'screenHelp.profile.exportFormats.csv',
    ],
  },
  {
    key: 'exportScope',
    titleKey: 'screenHelp.profile.exportScope.title',
    bulletKeys: [
      'screenHelp.profile.exportScope.all',
      'screenHelp.profile.exportScope.period',
      'screenHelp.profile.exportScope.selected',
    ],
  },
  {
    key: 'exportResult',
    titleKey: 'screenHelp.profile.exportResult.title',
    descriptionKey: 'screenHelp.profile.exportResult.description',
    bulletKeys: [
      'screenHelp.profile.exportResult.save',
      'screenHelp.profile.exportResult.share',
      'screenHelp.profile.exportResult.stored',
    ],
  },
  {
    key: 'savedExports',
    titleKey: 'screenHelp.profile.savedExports.title',
    descriptionKey: 'screenHelp.profile.savedExports.description',
    bulletKeys: [
      'screenHelp.profile.savedExports.search',
      'screenHelp.profile.savedExports.resume',
      'screenHelp.profile.savedExports.manage',
      'screenHelp.profile.savedExports.importSource',
    ],
  },
  {
    key: 'import',
    titleKey: 'screenHelp.profile.import.title',
    descriptionKey: 'screenHelp.profile.import.description',
    bulletKeys: [
      'screenHelp.profile.import.source',
      'screenHelp.profile.import.backupOnly',
      'screenHelp.profile.import.preview',
    ],
  },
  {
    key: 'importConflicts',
    titleKey: 'screenHelp.profile.importConflicts.title',
    descriptionKey: 'screenHelp.profile.importConflicts.description',
    bulletKeys: [
      'screenHelp.profile.importConflicts.skip',
      'screenHelp.profile.importConflicts.replace',
      'screenHelp.profile.importConflicts.review',
      'screenHelp.profile.importConflicts.confirm',
    ],
  },
  {
    key: 'importSafety',
    titleKey: 'screenHelp.profile.importSafety.title',
    bulletKeys: [
      'screenHelp.profile.importSafety.localOnly',
      'screenHelp.profile.importSafety.locked',
      'screenHelp.profile.importSafety.result',
    ],
  },
];

type ProfileHelpProps = {
  role: UserRole | null;
};

export const ProfileHelp = ({ role }: ProfileHelpProps) => {
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
        key: 'profile-help',
        labelKey: 'screenHelp.menuLabel',
        icon: 'help-circle-outline',
        onPress: handleOpen,
        placement: 'bottom',
      },
    ],
    [handleOpen]
  );

  const sections = useMemo<readonly ScreenHelpSection[]>(
    () =>
      role === UserRole.User
        ? [...PROFILE_HELP_SECTIONS, ...USER_TRANSFER_HELP_SECTIONS]
        : PROFILE_HELP_SECTIONS,
    [role]
  );

  useHeaderMenu(menuItems);

  return (
    <ScreenHelpModal
      visible={visible}
      titleKey="screenHelp.profile.title"
      introKey={
        role === UserRole.User
          ? 'screenHelp.profile.userIntro'
          : 'screenHelp.profile.intro'
      }
      sections={sections}
      onClose={handleClose}
    />
  );
};

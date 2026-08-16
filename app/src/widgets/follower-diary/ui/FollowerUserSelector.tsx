import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { SelectDropdown, type SelectDropdownOption } from '@shared/ui';

import type { FollowerDiaryUser } from '../model/useFollowerDiaryUsers';

type FollowerUserSelectorProps = {
  users: readonly FollowerDiaryUser[];

  selectedOwnerUid: string;

  loading: boolean;

  onSelect: (uid: string) => void;
};

export const FollowerUserSelector = ({
  users,

  selectedOwnerUid,

  loading,

  onSelect,
}: FollowerUserSelectorProps) => {
  const { t } = useTranslation();

  const options = useMemo<readonly SelectDropdownOption<string>[]>(
    () =>
      users.map((user) => ({
        value: user.uid,
        label: user.nickname,
        key: user.uid,
        icon: 'person-outline',
      })),
    [users]
  );

  const selectedUser =
    users.find((user) => user.uid === selectedOwnerUid) ?? null;

  return (
    <SelectDropdown
      label={t('diary.follower.userSelector.label')}
      placeholder={t(
        loading
          ? 'diary.follower.userSelector.loading'
          : 'diary.follower.userSelector.placeholder'
      )}
      selectedLabel={selectedUser?.nickname ?? null}
      options={options}
      inlineOptions
      disabled={loading}
      onSelect={onSelect}
      isSelected={(option) => option.value === selectedOwnerUid}
    />
  );
};

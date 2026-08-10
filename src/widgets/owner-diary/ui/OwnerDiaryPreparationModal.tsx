import { useTranslation } from 'react-i18next';

import { PortalModal, Spinner } from '@shared/ui';

import type { OwnerDiarySavedEntry } from '../model/useOwnerDiaryEntryEditor';
import * as s from '../styles/OwnerDiaryPreparationModal';

type OwnerDiaryPreparationModalProps = {
  entry: OwnerDiarySavedEntry | null;
};

const ignoreClose = () => undefined;

export const OwnerDiaryPreparationModal = ({
  entry,
}: OwnerDiaryPreparationModalProps) => {
  const { t } = useTranslation();

  return (
    <PortalModal
      visible={entry !== null}
      onClose={ignoreClose}
      withoutScroll
      withoutCloseBtn
      isDisabled
    >
      <s.Content>
        <Spinner size={40} />

        <s.Text>{t('diary.form.preparation.title')}</s.Text>
      </s.Content>
    </PortalModal>
  );
};

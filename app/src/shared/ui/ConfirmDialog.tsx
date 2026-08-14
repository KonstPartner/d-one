import { Modal } from 'react-native';
import { useTranslation } from 'react-i18next';

import * as s from './styles/ConfirmDialog';

type ConfirmDialogProps = {
  visible: boolean;

  title?: string;
  description?: string;
  confirmLabel?: string;

  confirmTone?: s.ConfirmDialogTone;
  confirmDisabled?: boolean;

  onConfirm: () => void | Promise<void>;
  onClose: () => void;
};

export const ConfirmDialog = ({
  visible,

  title,
  description,
  confirmLabel,

  confirmTone = 'primary',
  confirmDisabled = false,

  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <s.Backdrop onPress={onClose}>
        <s.Card
          onPress={(event) => {
            event.stopPropagation();
          }}
        >
          <s.Title>{title ?? t('common.confirmModal.title')}</s.Title>

          <s.Description>
            {description ?? t('common.confirmModal.description')}
          </s.Description>

          <s.Actions>
            <s.ActionButton
              tone={confirmTone}
              loading={confirmDisabled}
              onPress={() => {
                void onConfirm();
              }}
            >
              <s.ConfirmButtonText>
                {confirmLabel ?? t('common.confirmModal.confirm')}
              </s.ConfirmButtonText>
            </s.ActionButton>

            <s.ActionButton tone="input" onPress={onClose}>
              <s.CancelButtonText>{t('common.cancel')}</s.CancelButtonText>
            </s.ActionButton>
          </s.Actions>
        </s.Card>
      </s.Backdrop>
    </Modal>
  );
};

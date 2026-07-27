import { Modal, StyleProp, Text, View, ViewStyle } from 'react-native';
import { useTheme } from '@emotion/react';
import { useTranslation } from 'react-i18next';

import Button from '@entities/shared/ui/Button';
import * as globalStyles from '@features/shared/styles/global';

const ConfirmModal = ({
  title,
  description,
  buttonText,
  buttonStyle = null,
  modalVisible,
  setModalVisible,
  handleConfirmation,
}: {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonStyle?: StyleProp<ViewStyle> | null;
  modalVisible: boolean;
  setModalVisible: (label: boolean) => void;
  handleConfirmation: () => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const resolvedTitle = title ?? t('common.confirmModal.title');
  const resolvedDescription =
    description ?? t('common.confirmModal.description');
  const resolvedButtonText = buttonText ?? t('common.confirmModal.confirm');

  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={globalStyles.Modal}>
        <View style={globalStyles.ModalContent(theme)}>
          <Text style={globalStyles.Title(theme)}>{resolvedTitle}</Text>

          <Text style={globalStyles.TextStyle(theme)}>
            {resolvedDescription}
          </Text>

          <View style={globalStyles.ActionsRow(theme)}>
            <Button
              style={[
                globalStyles.FlexItem,
                buttonStyle ?? globalStyles.ButtonStyles(theme),
              ]}
              onPress={handleConfirmation}
            >
              <Text style={globalStyles.ButtonText(theme)}>
                {resolvedButtonText}
              </Text>
            </Button>

            <Button
              style={[
                globalStyles.FlexItem,
                globalStyles.Button(theme, 'secondary'),
              ]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={globalStyles.ButtonText(theme, 'secondary')}>
                {t('common.cancel')}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmModal;

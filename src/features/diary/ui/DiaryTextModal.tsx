import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as globalStyles from '@features/shared/styles/global';
import { Button } from '@entities/shared/ui';

import * as styles from '../styles/DiaryTextModal';

type DiaryTextModalProps = {
  visible: boolean;
  title: string;
  text: string;
  onClose: () => void;
};

const DiaryTextModal = ({
  visible,
  title,
  text,
  onClose,
}: DiaryTextModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.Root}>
        <Pressable
          accessible={false}
          style={styles.Backdrop}
          onPress={onClose}
        />

        <SafeAreaView
          accessibilityViewIsModal
          onAccessibilityEscape={onClose}
          edges={['bottom']}
          style={styles.Sheet(theme)}
        >
          <View style={styles.Header(theme)}>
            <View style={globalStyles.FlexItem}>
              <Text style={globalStyles.Subheading(theme)} numberOfLines={1}>
                {title}
              </Text>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              hitSlop={8}
              onPress={onClose}
              style={({ pressed }) => [
                globalStyles.IconButton(theme, 'ghost', 'sm'),
                pressed && styles.Pressed,
              ]}
            >
              <Ionicons
                name="close"
                size={theme.size.md}
                color={theme.colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.Body}
            contentContainerStyle={styles.BodyContent(theme)}
            showsVerticalScrollIndicator
          >
            <Text selectable style={globalStyles.Body(theme)}>
              {text}
            </Text>
          </ScrollView>

          <View style={styles.Footer(theme)}>
            <Button
              style={[globalStyles.Button(theme), globalStyles.FullWidth]}
              onPress={onClose}
            >
              <Text style={globalStyles.ButtonText(theme)}>
                {t('common.close')}
              </Text>
            </Button>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default DiaryTextModal;

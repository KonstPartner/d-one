import i18n from 'i18next';
import { Toast } from 'toastify-react-native';

export type NotificationType = 'success' | 'error' | 'info' | 'warn';

const NOTIFICATION_LABEL_KEYS: Record<NotificationType, string> = {
  success: 'common.notifications.type.success',
  error: 'common.notifications.type.error',
  info: 'common.notifications.type.info',
  warn: 'common.notifications.type.warn',
};

const DEFAULT_NOTIFICATION_DURATION = 4000;

export const showNotification = (
  type: NotificationType,
  message: string
): void => {
  const options = {
    type,
    position: 'top',
    text1: i18n.t(NOTIFICATION_LABEL_KEYS[type]),
    text2: message,
    autoHide: false,
    visibilityTime: 0,
    data: {
      durationMs: DEFAULT_NOTIFICATION_DURATION,
    },
  };

  Toast.show(options as Parameters<typeof Toast.show>[0]);
};

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { errorMapper } from '@features/shared/model/utils/error';
import { showNotification } from '@features/shared/ui';
import { useSession } from '@entities/session';

import { verifyUserEmail } from '../../api/firebase/services/verifyUserEmail';
import useCheckVerifiedEmail from '../../api/hooks/useCheckVerifiedEmail';

const useVerifyEmailButtons = () => {
  const { t } = useTranslation();

  const { syncSessionUser } = useSession();

  const [isSentMessage, setIsSentMessage] = useState(false);

  const [isSending, setIsSending] = useState(false);

  const { mutate: checkVerifiedEmailMutation, isPending: isChecking } =
    useCheckVerifiedEmail();

  const isPressed = isSending || isChecking;

  const sendEmailMessage = async () => {
    if (isPressed || isSentMessage) {
      return;
    }

    try {
      setIsSending(true);

      await verifyUserEmail();

      setIsSentMessage(true);

      showNotification(
        'success',
        t('auth.notifications.email.verificationMessageSent')
      );
    } catch (error: unknown) {
      showNotification('error', errorMapper(error, 'firebase'));
    } finally {
      setIsSending(false);
    }
  };

  const checkVerifiedEmail = () => {
    checkVerifiedEmailMutation(undefined, {
      onSuccess: (emailVerified) => {
        if (emailVerified) {
          syncSessionUser();
        }
      },
    });
  };

  return {
    isSentMessage,
    isPressed,
    sendEmailMessage,
    checkVerifiedEmail,
    t,
  };
};

export default useVerifyEmailButtons;

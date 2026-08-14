import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, PortalModal } from '@shared/ui';

import * as s from '../styles/DiaryEntryEditorModal';

type DiaryEntryEditorModalProps = {
  visible: boolean;

  title: string;
  submitLabel: string;
  submitIcon: ComponentProps<typeof Ionicons>['name'];

  children: ReactNode;

  disabled?: boolean;
  isSubmitting?: boolean;
  isBusy?: boolean;

  onClose: () => void;
  onSubmit: () => void;
};

export const DiaryEntryEditorModal = ({
  visible,
  title,
  submitLabel,
  submitIcon,
  children,
  disabled = false,
  isSubmitting = false,
  isBusy = false,
  onClose,
  onSubmit,
}: DiaryEntryEditorModalProps) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const submitDisabled = disabled || isBusy;

  return (
    <PortalModal
      visible={visible}
      onClose={onClose}
      withoutScroll
      withoutCloseBtn
      isDisabled={isBusy}
    >
      <s.Root>
        <s.Header>
          <s.Title>{title}</s.Title>
        </s.Header>

        <s.Scroll
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <s.Content>{children}</s.Content>
        </s.Scroll>

        <s.Footer>
          <Button
            tone="input"
            disabled={isBusy}
            accessibilityRole="button"
            accessibilityLabel={t('diary.form.cancel')}
            onPress={onClose}
            style={s.actionStyle}
          >
            <s.ButtonContent>
              <Ionicons
                name="close"
                size={theme.size.md}
                color={isBusy ? theme.colors.muted : theme.colors.text}
              />

              <s.CancelText $disabled={isBusy}>
                {t('diary.form.cancel')}
              </s.CancelText>
            </s.ButtonContent>
          </Button>

          <Button
            tone="primary"
            loading={isSubmitting}
            disabled={submitDisabled}
            accessibilityRole="button"
            accessibilityLabel={submitLabel}
            onPress={onSubmit}
            style={s.actionStyle}
          >
            <s.ButtonContent>
              <Ionicons
                name={submitIcon}
                size={theme.size.md}
                color={
                  submitDisabled
                    ? theme.colors.shades.primary.text
                    : theme.colors.white
                }
              />

              <s.SubmitText $disabled={submitDisabled}>
                {submitLabel}
              </s.SubmitText>
            </s.ButtonContent>
          </Button>
        </s.Footer>
      </s.Root>
    </PortalModal>
  );
};

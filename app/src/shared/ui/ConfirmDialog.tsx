import { Modal } from 'react-native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';

import type { ButtonTone } from './styles/Button';
import * as s from './styles/ConfirmDialog';

type DialogIcon = ComponentProps<typeof Ionicons>['name'];

export type DialogAction = {
  key: string;
  label: string;

  icon?: DialogIcon;
  tone?: ButtonTone;

  disabled?: boolean;

  onPress: () => void | Promise<void>;
};

type ConfirmDialogProps = {
  visible: boolean;

  title?: string;
  description?: string;

  confirmLabel?: string;

  confirmTone?: s.ConfirmDialogTone;
  confirmDisabled?: boolean;

  actions?: readonly (readonly DialogAction[])[];

  onConfirm?: () => void | Promise<void>;
  onClose: () => void;
};

const getActionColor = (
  tone: ButtonTone,
  textColor: string,
  inverseColor: string
): string => {
  switch (tone) {
    case 'card':
    case 'input':
      return textColor;

    default:
      return inverseColor;
  }
};

export const ConfirmDialog = ({
  visible,

  title,
  description,

  confirmLabel,

  confirmTone = 'primary',
  confirmDisabled = false,

  actions,

  onConfirm,
  onClose,
}: ConfirmDialogProps) => {
  const theme = useTheme();

  const { t } = useTranslation();

  const actionMode = actions !== undefined;

  const resolvedDescription =
    description ?? (actionMode ? null : t('common.confirmModal.description'));

  const handleActionPress = (action: DialogAction): void => {
    if (action.disabled) {
      return;
    }

    onClose();

    void action.onPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      animationType="fade"
      onRequestClose={onClose}
    >
      <s.Backdrop style={ss.CenterContent} onPress={onClose}>
        <s.Card
          style={[ss.Rounded(theme, 'lg'), ss.Shadow(theme, 'strong')]}
          onPress={(event) => {
            event.stopPropagation();
          }}
        >
          <s.Title style={ss.Text(theme, 'lg', 'bold', 'default', 'xl')}>
            {title ?? t('common.confirmModal.title')}
          </s.Title>

          {resolvedDescription !== null && (
            <s.Description
              style={[
                ss.Body(theme),
                {
                  color: theme.colors.text,
                },
              ]}
            >
              {resolvedDescription}
            </s.Description>
          )}

          {actionMode ? (
            <s.ActionGroups>
              {actions.map((group, groupIndex) => (
                <s.ActionRow key={groupIndex}>
                  {group.map((action) => {
                    const tone = action.tone ?? 'input';

                    const color = getActionColor(
                      tone,
                      theme.colors.text,
                      theme.colors.white
                    );

                    return (
                      <s.ActionButton
                        key={action.key}
                        tone={tone}
                        disabled={action.disabled}
                        onPress={() => {
                          handleActionPress(action);
                        }}
                      >
                        <s.ActionContent>
                          {action.icon !== undefined && (
                            <Ionicons
                              name={action.icon}
                              size={theme.size.lg}
                              color={color}
                            />
                          )}

                          <s.ActionLabel
                            numberOfLines={2}
                            style={[
                              ss.Text(theme, 'sm', 'bold', 'default', 'md'),
                              {
                                color,
                              },
                            ]}
                          >
                            {action.label}
                          </s.ActionLabel>
                        </s.ActionContent>
                      </s.ActionButton>
                    );
                  })}
                </s.ActionRow>
              ))}

              <s.CancelActionButton tone="input" onPress={onClose}>
                <s.ActionContent>
                  <Ionicons
                    name="close-outline"
                    size={theme.size.lg}
                    color={theme.colors.text}
                  />

                  <s.ActionLabel
                    style={[
                      ss.Text(theme, 'sm', 'bold', 'default', 'md'),
                      {
                        color: theme.colors.text,
                      },
                    ]}
                  >
                    {t('common.cancel')}
                  </s.ActionLabel>
                </s.ActionContent>
              </s.CancelActionButton>
            </s.ActionGroups>
          ) : (
            <s.StandardActions>
              <s.StandardActionButton
                tone={confirmTone}
                loading={confirmDisabled}
                onPress={() => {
                  void onConfirm?.();
                }}
              >
                <s.StandardButtonText
                  style={ss.Text(theme, 'md', 'bold', 'inverse', 'md')}
                >
                  {confirmLabel ?? t('common.confirmModal.confirm')}
                </s.StandardButtonText>
              </s.StandardActionButton>

              <s.StandardActionButton tone="input" onPress={onClose}>
                <s.StandardButtonText
                  style={[
                    ss.Text(theme, 'md', 'bold', 'default', 'md'),
                    {
                      color: theme.colors.text,
                    },
                  ]}
                >
                  {t('common.cancel')}
                </s.StandardButtonText>
              </s.StandardActionButton>
            </s.StandardActions>
          )}
        </s.Card>
      </s.Backdrop>
    </Modal>
  );
};

import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import * as ss from '@shared/styles';
import { PageLayout } from '@shared/ui';

import * as s from '../styles/PendingPage';

export const PendingPage = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <PageLayout>
      <s.Content style={ss.CenterContent}>
        <s.Card style={ss.FullWidth}>
          <s.Icon style={[ss.CenterContent, ss.Rounded(theme, 'full')]}>
            <Ionicons
              name="time-outline"
              size={theme.control.height.sm}
              color={theme.colors.primary}
            />
          </s.Icon>

          <s.TextContent style={ss.FullWidth}>
            <s.Title>{t('diary.pending.title')}</s.Title>

            <s.Description>{t('diary.pending.description')}</s.Description>
          </s.TextContent>
        </s.Card>
      </s.Content>
    </PageLayout>
  );
};

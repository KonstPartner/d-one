import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import { PlatformOS } from '@shared/lib/platform';
import * as ss from '@shared/styles';

type WebRefreshButtonProps = {
  onRefresh: () => void;
};

export const WebRefreshButton = ({ onRefresh }: WebRefreshButtonProps) => {
  const theme = useTheme();

  if (!PlatformOS.WEB) {
    return null;
  }

  return (
    <Root>
      <RefreshButton accessibilityRole="button" onPress={onRefresh}>
        <Ionicons
          name="refresh-circle"
          size={theme.control.height.sm}
          color={theme.colors.text}
        />
      </RefreshButton>
    </Root>
  );
};

const Root = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const RefreshButton = styled.Pressable`
  ${ss.CenterContent};
`;

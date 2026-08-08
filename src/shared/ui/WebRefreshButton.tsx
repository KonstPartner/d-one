import styled from '@emotion/native';
import { useTheme } from '@emotion/react';
import { Ionicons } from '@expo/vector-icons';

import { PlatformOS } from '@shared/lib/platform';

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
      <Button accessibilityRole="button" onPress={onRefresh}>
        <Ionicons name="refresh-circle" size={32} color={theme.colors.text} />
      </Button>
    </Root>
  );
};

const Root = styled.View`
  flex-direction: row;
  justify-content: center;
`;

const Button = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

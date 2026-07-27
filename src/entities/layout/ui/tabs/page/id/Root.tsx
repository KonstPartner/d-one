import { useTheme } from '@emotion/react';
import { Stack } from 'expo-router';

const PageRoot = () => {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    >
      <Stack.Screen name="index" />
    </Stack>
  );
};

export default PageRoot;

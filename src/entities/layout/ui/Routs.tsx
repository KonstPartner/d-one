import { View } from 'react-native';
import { useTheme } from '@emotion/react';
import { Stack } from 'expo-router';

const Routs = () => {
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.bg }}>
      <View
        style={{
          flex: 1,
          maxWidth: 500,
          minWidth: 320,
          width: '100%',
          margin: 'auto',
        }}
      >
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="auth-callback" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </View>
    </View>
  );
};

export default Routs;

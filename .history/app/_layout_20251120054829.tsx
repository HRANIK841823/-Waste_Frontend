import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

// This setting is correct for how Expo Router finds the tabs group
export const unstable_settings = {
  initialRouteName: 'start', // Ensure 'start' is the first route if you want it to always show first
  // The anchor for the tabs group remains (tabs)
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* 1. Start Screen - Set as the initial screen and hide the header */}
        <Stack.Screen name="start" options={{ headerShown: false }} />

        {/* 2. Authentication Screens - Hide headers for a clean auth flow */}
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />

        {/* 3. Authenticated Tabs Group - Hide its header as the tabs layout will provide its own structure */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 4. Modal Screen - Keep presentation: 'modal' */}
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />

        {/* Ensure all root-level files (login, register, modal, start) 
          are explicitly defined here in the stack 
        */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
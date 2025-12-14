// import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import 'react-native-reanimated';

// import { useColorScheme } from '@/hooks/use-color-scheme';

// // ⭐ ADD THESE 2 IMPORTS
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import React from 'react';

// export const unstable_settings = {
//   initialRouteName: 'start',
//   //anchor: '(tabs)',
// };

// const queryClient = new QueryClient(); // ⭐ CREATE CLIENT

// export default function RootLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <QueryClientProvider client={queryClient}>   {/* ⭐ WRAP EVERYTHING */}
//       <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//         <Stack>
//           <Stack.Screen name="start" options={{ headerShown: false }} />
//           <Stack.Screen name="login" options={{ headerShown: false }} />
//           <Stack.Screen name="register" options={{ headerShown: false }} />
//           <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//           <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
//         </Stack>
//         <StatusBar style="auto" />
//       </ThemeProvider>
//     </QueryClientProvider>
//   );
// }
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import 'react-native-reanimated';

const queryClient = new QueryClient();

export const unstable_settings = {
  initialRouteName: 'start',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        {/* ✅ Render Slot instead of Stack directly */}
        <Slot /> 
        <StatusBar style="auto" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

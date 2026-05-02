import React from 'react';
import { Slot } from 'expo-router';
import { ThemeProvider } from '../src/theme/ThemeProvider';
import { useAppStore } from '../src/store/appStore';

export default function RootLayout() {
  const themeMode = useAppStore((s) => s.themeMode);

  return (
    <ThemeProvider mode={themeMode}>
      <Slot />
    </ThemeProvider>
  );
}

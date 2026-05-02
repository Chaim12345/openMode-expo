import React from 'react';
import { Tabs } from 'expo-router';
import { useTheme } from '../../src/theme/ThemeProvider';
import { getColors } from '../../src/theme/colors';

export default function TabLayout() {
  const { isDark } = useTheme();
  const colors = getColors(isDark);

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="sessions"
        options={{ title: 'Sessions', tabBarLabel: 'Sessions' }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarLabel: 'Settings' }}
      />
    </Tabs>
  );
}

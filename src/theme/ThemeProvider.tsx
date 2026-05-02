import React, { useEffect, useMemo } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';

interface ThemeProviderProps {
  mode: 'light' | 'dark' | 'system';
  children: React.ReactNode;
}

export function ThemeProvider({ mode, children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const setThemeMode = useAppStore((s) => s.setThemeMode);

  const activeTheme = useMemo(() => {
    if (mode === 'system') {
      return systemColorScheme ?? 'light';
    }
    return mode;
  }, [mode, systemColorScheme]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (mode === 'system') {
        // System theme changed, re-render handled by useColorScheme
      }
    });
    return () => subscription.remove();
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ theme: activeTheme, isDark: activeTheme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

interface ThemeContextType {
  theme: 'light' | 'dark';
  isDark: boolean;
}

const ThemeContext = React.createContext<ThemeContextType>({
  theme: 'light',
  isDark: false,
});

export function useTheme() {
  return React.useContext(ThemeContext);
}

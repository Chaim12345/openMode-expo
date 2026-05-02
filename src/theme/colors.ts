export const lightColors = {
  primary: '#007AFF',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#FF3B30',
  success: '#34C759',
};

export const darkColors = {
  primary: '#0A84FF',
  background: '#000000',
  surface: '#1C1C1E',
  card: '#2C2C2E',
  text: '#FFFFFF',
  textSecondary: '#999999',
  border: '#3C3C3E',
  error: '#FF453A',
  success: '#30D158',
};

export type ThemeColors = typeof lightColors;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? darkColors : lightColors;
}

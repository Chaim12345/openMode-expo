import React from 'react';
import { render } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';

describe('ThemeProvider', () => {
  it('should render with light theme', () => {
    const { getByText } = render(
      <ThemeProvider mode="light">
        <Text>Test</Text>
      </ThemeProvider>
    );
    expect(getByText('Test')).toBeTruthy();
  });

  it('should provide theme context', () => {
    let themeContext: any;
    const TestComponent = () => {
      themeContext = useTheme();
      return <Text>Test</Text>;
    };
    render(
      <ThemeProvider mode="light">
        <TestComponent />
      </ThemeProvider>
    );
    expect(themeContext).toBeDefined();
    expect(themeContext.isDark).toBeDefined();
  });
});

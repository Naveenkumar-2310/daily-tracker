import { MD3LightTheme } from 'react-native-paper';

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#4F46E5', // Luxury Indigo
    onPrimary: '#FFFFFF',
    primaryContainer: '#EEF2FF',
    onPrimaryContainer: '#312E81',
    secondary: '#D97706', // Refined Amber for Fuel
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FEF3C7',
    onSecondaryContainer: '#78350F',
    tertiary: '#0D9488', // Emerald Teal
    background: '#F8FAFC', // Crisp porcelain background
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    outline: '#E2E8F0',
    outlineVariant: '#CBD5E1',
    error: '#E11D48', // Elegant Rose
    success: '#059669', // Emerald Green
  },
};

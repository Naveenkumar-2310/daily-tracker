import { MD3LightTheme, MD3DarkTheme, MD3Theme } from 'react-native-paper';

export type AppThemeMode = 'light' | 'dark' | 'high-contrast';

export interface CustomThemeColors {
  success: string;
  onSuccess: string;
  cardBorder: string;
  cardBg: string;
  subText: string;
  metricBoxBg: string;
  statusChipBg: string;
  urgentBg: string;
  urgentText: string;
}

export type ExtendedTheme = MD3Theme & {
  colors: MD3Theme['colors'] & CustomThemeColors;
  isDark: boolean;
  isHighContrast: boolean;
};

// 1. Crisp Light Mode (Porcelain Slate)
export const AppLightTheme: ExtendedTheme = {
  ...MD3LightTheme,
  isDark: false,
  isHighContrast: false,
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
    background: '#F8FAFC', // Slate background
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    outline: '#E2E8F0',
    outlineVariant: '#CBD5E1',
    error: '#E11D48',
    success: '#059669',
    onSuccess: '#FFFFFF',
    cardBorder: '#E2E8F0',
    cardBg: '#FFFFFF',
    subText: '#64748B',
    metricBoxBg: '#F8FAFC',
    statusChipBg: '#F1F5F9',
    urgentBg: '#FEF2F2',
    urgentText: '#991B1B',
  },
};

// 2. Dark Mode (OLED Deep Midnight #090D16 - Ideal for late night pill intake)
export const AppDarkTheme: ExtendedTheme = {
  ...MD3DarkTheme,
  isDark: true,
  isHighContrast: false,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#818CF8', // Soft Violet / Indigo for OLED
    onPrimary: '#0F172A',
    primaryContainer: '#1E1B4B',
    onPrimaryContainer: '#C7D2FE',
    secondary: '#FBBF24', // Soft Warm Gold Amber
    onSecondary: '#451A03',
    secondaryContainer: '#451A03',
    onSecondaryContainer: '#FDE68A',
    tertiary: '#2DD4BF',
    background: '#090D16', // Deep OLED Midnight
    surface: '#131B2E', // Subtle Navy Surface
    surfaceVariant: '#1E293B',
    outline: '#334155',
    outlineVariant: '#1E293B',
    error: '#F87171',
    success: '#34D399',
    onSuccess: '#064E3B',
    cardBorder: '#1E293B',
    cardBg: '#131B2E',
    subText: '#94A3B8',
    metricBoxBg: '#0F172A',
    statusChipBg: '#1E293B',
    urgentBg: '#450A0A',
    urgentText: '#FCA5A5',
  },
};

// 3. High-Contrast Accessible Mode (Elderly Friendly with pure high contrast & prominent borders)
export const AppHighContrastTheme: ExtendedTheme = {
  ...MD3LightTheme,
  isDark: false,
  isHighContrast: true,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#000000', // Solid High-contrast Black
    onPrimary: '#FFFFFF',
    primaryContainer: '#F4F4F5',
    onPrimaryContainer: '#000000',
    secondary: '#B45309', // High-contrast Deep Amber
    onSecondary: '#FFFFFF',
    secondaryContainer: '#FEF3C7',
    onSecondaryContainer: '#000000',
    tertiary: '#0F766E',
    background: '#FFFFFF', // Stark White
    surface: '#FFFFFF',
    surfaceVariant: '#F4F4F5',
    outline: '#000000', // Pure solid black border
    outlineVariant: '#52525B',
    error: '#B91C1C',
    success: '#047857',
    onSuccess: '#FFFFFF',
    cardBorder: '#000000',
    cardBg: '#FFFFFF',
    subText: '#18181B',
    metricBoxBg: '#F4F4F5',
    statusChipBg: '#E4E4E7',
    urgentBg: '#FEE2E2',
    urgentText: '#7F1D1D',
  },
};

export const getTheme = (mode: AppThemeMode): ExtendedTheme => {
  switch (mode) {
    case 'dark':
      return AppDarkTheme;
    case 'high-contrast':
      return AppHighContrastTheme;
    case 'light':
    default:
      return AppLightTheme;
  }
};

export const AppTheme = AppLightTheme;

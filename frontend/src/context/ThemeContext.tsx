import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppThemeMode, ExtendedTheme, getTheme } from '../theme/theme';

interface ThemeContextProps {
  themeMode: AppThemeMode;
  theme: ExtendedTheme;
  setThemeMode: (mode: AppThemeMode) => void;
  cycleTheme: () => void;
}

const STORAGE_KEY = '@daily_tracker_theme_mode';

const ThemeContext = createContext<ThemeContextProps>({
  themeMode: 'light',
  theme: getTheme('light'),
  setThemeMode: () => {},
  cycleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setModeState] = useState<AppThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'dark' || saved === 'high-contrast' || saved === 'light') {
        setModeState(saved as AppThemeMode);
      }
    }).catch(() => {});
  }, []);

  const setThemeMode = (mode: AppThemeMode) => {
    setModeState(mode);
    AsyncStorage.setItem(STORAGE_KEY, mode).catch(() => {});
  };

  const cycleTheme = () => {
    let next: AppThemeMode = 'dark';
    if (themeMode === 'light') next = 'dark';
    else if (themeMode === 'dark') next = 'high-contrast';
    else next = 'light';
    setThemeMode(next);
  };

  const theme = getTheme(themeMode);

  return (
    <ThemeContext.Provider value={{ themeMode, theme, setThemeMode, cycleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);

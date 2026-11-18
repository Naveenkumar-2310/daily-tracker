import React from 'react';
import { Appbar, useTheme } from 'react-native-paper';
import { StyleSheet, View } from 'react-native';
import { ExtendedTheme } from '../../theme/theme';
import { useAppTheme } from '../../context/ThemeContext';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
  actions?: Array<{
    icon: string;
    onPress: () => void;
  }>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onMenu,
  actions = [],
}) => {
  const theme = useTheme<ExtendedTheme>();
  const { themeMode, cycleTheme } = useAppTheme();

  const themeIcon =
    themeMode === 'dark'
      ? 'weather-night'
      : themeMode === 'high-contrast'
        ? 'eye-outline'
        : 'weather-sunny';

  return (
    <Appbar.Header
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.cardBorder || theme.colors.outline,
          borderBottomWidth: theme.isHighContrast ? 2 : 1,
        },
      ]}
    >
      {onBack ? (
        <Appbar.BackAction onPress={onBack} color={theme.colors.onSurface} />
      ) : onMenu ? (
        <Appbar.Action icon="menu" onPress={onMenu} color={theme.colors.onSurface} />
      ) : null}

      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={[
          styles.title,
          {
            color: theme.colors.onSurface,
            fontWeight: theme.isHighContrast ? '900' : '800',
          },
        ]}
        subtitleStyle={[
          styles.subtitle,
          {
            color: theme.colors.subText || theme.colors.onSurfaceVariant,
            fontWeight: theme.isHighContrast ? '600' : '400',
          },
        ]}
      />

      {/* Screen-specific Action Buttons */}
      {actions.map((act, index) => (
        <Appbar.Action
          key={index}
          icon={act.icon}
          onPress={act.onPress}
          color={theme.colors.onSurface}
        />
      ))}

      {/* 1-Tap Theme Cycle Button (Light -> Dark -> High-Contrast) */}
      <Appbar.Action
        icon={themeIcon}
        onPress={cycleTheme}
        color={themeMode === 'dark' ? '#818CF8' : themeMode === 'high-contrast' ? '#000000' : '#D97706'}
      />
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    elevation: 0,
    height: 60,
  },
  title: {
    fontSize: 18,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: -2,
  },
});

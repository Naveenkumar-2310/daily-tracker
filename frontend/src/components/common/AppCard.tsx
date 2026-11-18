import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { ExtendedTheme } from '../../theme/theme';

export interface AppCardProps {
  title?: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  leftIcon,
  rightAction,
  children,
  style,
}) => {
  const theme = useTheme<ExtendedTheme>();

  return (
    <Card
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBg || theme.colors.surface,
          borderColor: theme.colors.cardBorder || theme.colors.outline,
          borderWidth: theme.isHighContrast ? 2 : 1,
        },
        style,
      ]}
      elevation={theme.isDark ? 0 : 2}
    >
      {(title || subtitle || rightAction || leftIcon) && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            <View style={styles.titleTextWrapper}>
              {title && (
                <Text
                  variant="titleMedium"
                  style={[
                    styles.title,
                    {
                      color: theme.colors.onSurface,
                      fontWeight: theme.isHighContrast ? '900' : '700',
                    },
                  ]}
                >
                  {title}
                </Text>
              )}
              {subtitle && (
                <Text
                  variant="bodySmall"
                  style={[
                    styles.subtitle,
                    {
                      color: theme.colors.subText || theme.colors.onSurfaceVariant,
                      fontWeight: theme.isHighContrast ? '600' : '400',
                    },
                  ]}
                >
                  {subtitle}
                </Text>
              )}
            </View>
          </View>
          {rightAction && <View style={styles.actionWrapper}>{rightAction}</View>}
        </View>
      )}
      <Card.Content style={styles.content}>{children}</Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginVertical: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 10,
  },
  titleTextWrapper: {
    flex: 1,
  },
  title: {
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  actionWrapper: {
    marginLeft: 8,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },
});

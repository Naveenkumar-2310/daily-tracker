import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { Card, Text } from 'react-native-paper';

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
  return (
    <Card style={[styles.card, style]} elevation={0}>
      {(title || subtitle || rightAction || leftIcon) && (
        <View style={styles.header}>
          <View style={styles.titleRow}>
            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            <View style={styles.titleTextWrapper}>
              {title && <Text variant="titleMedium" style={styles.title}>{title}</Text>}
              {subtitle && <Text variant="bodySmall" style={styles.subtitle}>{subtitle}</Text>}
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
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
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: '#64748B',
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

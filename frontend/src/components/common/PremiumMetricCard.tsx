import React from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExtendedTheme } from '../../theme/theme';

export interface PremiumMetricCardProps {
  title: string;
  amount: string | number;
  subtitle?: string;
  icon: any;
  accentColor: string;
  trendText?: string;
  trendPositive?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const PremiumMetricCard: React.FC<PremiumMetricCardProps> = ({
  title,
  amount,
  subtitle,
  icon,
  accentColor,
  trendText,
  trendPositive = true,
  onPress,
  style,
}) => {
  const theme = useTheme<ExtendedTheme>();

  const formattedAmount =
    typeof amount === 'number'
      ? isNaN(amount) ? '₹0' : `₹${amount.toLocaleString('en-IN')}`
      : amount || '₹0';

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBg || theme.colors.surface,
          borderColor: theme.colors.cardBorder || theme.colors.outline,
          borderWidth: 1,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: `${accentColor}18` }]}>
          <MaterialCommunityIcons name={icon} size={22} color={accentColor} />
        </View>

        {trendText && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trendPositive ? '#DCFCE7' : '#FEE2E2',
              },
            ]}
          >
            <MaterialCommunityIcons
              name={trendPositive ? 'trending-up' : 'trending-down'}
              size={14}
              color={trendPositive ? '#15803D' : '#B91C1C'}
            />
            <Text
              style={[
                styles.trendText,
                { color: trendPositive ? '#15803D' : '#B91C1C' },
              ]}
            >
              {trendText}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.body}>
        <Text variant="labelMedium" style={[styles.title, { color: theme.colors.subText || '#64748B' }]}>
          {title}
        </Text>
        <Text
          variant="headlineSmall"
          style={[styles.amount, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {formattedAmount}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" style={[styles.subtitle, { color: theme.colors.subText || '#94A3B8' }]}>
            {subtitle}
          </Text>
        )}
      </View>

      {/* Decorative accent bottom line */}
      <View style={[styles.accentLine, { backgroundColor: accentColor }]} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    minWidth: 150,
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    gap: 2,
  },
  title: {
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
    fontSize: 11,
  },
  amount: {
    fontWeight: '800',
    letterSpacing: -0.5,
    fontSize: 22,
    marginVertical: 2,
  },
  subtitle: {
    fontSize: 12,
  },
  accentLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
});


import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { ExtendedTheme } from '../../theme/theme';

interface BudgetProgressBarProps {
  spent: number;
  budget: number;
  label?: string;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  spent,
  budget,
  label = 'Monthly Spending Target',
}) => {
  const theme = useTheme<ExtendedTheme>();

  const percentage = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
  const rawPercentage = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const isOverBudget = spent > budget && budget > 0;
  const remaining = Math.max(0, budget - spent);

  // Dynamic status color
  let barColor = '#10B981'; // Green
  let statusBadgeBg = '#DCFCE7';
  let statusBadgeText = '#15803D';

  if (rawPercentage >= 90) {
    barColor = '#EF4444'; // Red
    statusBadgeBg = '#FEE2E2';
    statusBadgeText = '#B91C1C';
  } else if (rawPercentage >= 75) {
    barColor = '#F59E0B'; // Amber
    statusBadgeBg = '#FEF3C7';
    statusBadgeText = '#B45309';
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.cardBg || theme.colors.surface,
          borderColor: theme.colors.cardBorder || theme.colors.outline,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text variant="labelMedium" style={[styles.label, { color: theme.colors.subText || '#64748B' }]}>
            {label}
          </Text>
          <Text variant="titleMedium" style={[styles.budgetTotal, { color: theme.colors.onSurface }]}>
            ₹{spent.toLocaleString('en-IN')} <Text style={[styles.subBudget, { color: theme.colors.subText }]}>/ ₹{budget.toLocaleString('en-IN')}</Text>
          </Text>
        </View>

        <View style={[styles.badge, { backgroundColor: statusBadgeBg }]}>
          <Text style={[styles.badgeText, { color: statusBadgeText }]}>
            {isOverBudget ? `Over by ₹${(spent - budget).toLocaleString('en-IN')}` : `${rawPercentage}% Spent`}
          </Text>
        </View>
      </View>

      {/* Progress Track */}
      <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant || '#E2E8F0' }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>

      <View style={styles.footerRow}>
        <Text variant="bodySmall" style={{ color: theme.colors.subText }}>
          {isOverBudget ? '⚠️ Budget limit exceeded' : `₹${remaining.toLocaleString('en-IN')} remaining safe to spend`}
        </Text>
        <Text variant="bodySmall" style={{ fontWeight: '700', color: theme.colors.onSurface }}>
          {budget > 0 ? `${100 - percentage}% left` : 'No budget set'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  budgetTotal: {
    fontWeight: '800',
    fontSize: 18,
    marginTop: 2,
  },
  subBudget: {
    fontWeight: '400',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    width: '100%',
    marginVertical: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});


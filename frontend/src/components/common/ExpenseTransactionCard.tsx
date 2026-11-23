import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExtendedTheme } from '../../theme/theme';

export interface ExpenseItemData {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  categoryName: string;
  date: string;
  paymentMode: 'CASH' | 'UPI' | 'BANK' | 'CARD';
  accountName?: string;
  notes?: string;
  vehicleId?: string;
  isRecurring?: boolean;
}

interface ExpenseTransactionCardProps {
  item: ExpenseItemData;
  categoryIcon?: string;
  categoryColor?: string;
  onPress?: () => void;
  onDelete?: () => void;
}

export const ExpenseTransactionCard: React.FC<ExpenseTransactionCardProps> = ({
  item,
  categoryIcon = 'tag',
  categoryColor = '#4F46E5',
  onPress,
  onDelete,
}) => {
  const theme = useTheme<ExtendedTheme>();
  const isIncome = item.type === 'INCOME';

  const paymentModeIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
    UPI: 'qrcode-scan',
    CASH: 'cash',
    BANK: 'bank',
    CARD: 'credit-card-outline',
  };

  const modeIcon = paymentModeIcons[item.paymentMode] || 'wallet-outline';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.cardBg || theme.colors.surface,
          borderColor: theme.colors.cardBorder || theme.colors.outline,
        },
      ]}
    >
      <View style={styles.leftCol}>
        <View style={[styles.iconCircle, { backgroundColor: `${categoryColor}18` }]}>
          <MaterialCommunityIcons
            name={(categoryIcon as any) || 'tag'}
            size={22}
            color={categoryColor}
          />
        </View>

        <View style={styles.infoWrapper}>
          <View style={styles.titleRow}>
            <Text variant="titleSmall" style={[styles.categoryTitle, { color: theme.colors.onSurface }]}>
              {item.categoryName}
            </Text>
            {Boolean(item.vehicleId) ? (
              <View style={[styles.tagBadge, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="gas-station" size={11} color="#B45309" />
                <Text style={styles.tagText}>Fuel Sync</Text>
              </View>
            ) : null}
            {Boolean(item.isRecurring) ? (
              <View style={[styles.tagBadge, { backgroundColor: '#EDE9FE' }]}>
                <MaterialCommunityIcons name="repeat" size={11} color="#6D28D9" />
                <Text style={[styles.tagText, { color: '#6D28D9' }]}>Recurring</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.metaRow}>
            <Text variant="bodySmall" style={{ color: theme.colors.subText }}>
              {item.date}
            </Text>
            <Text variant="bodySmall" style={{ color: theme.colors.subText }}>•</Text>
            <View style={styles.paymentChip}>
              <MaterialCommunityIcons name={modeIcon} size={12} color={theme.colors.subText} />
              <Text variant="bodySmall" style={{ color: theme.colors.subText, fontSize: 11 }}>
                {item.paymentMode}
              </Text>
            </View>
            {Boolean(item.notes) ? (
              <>
                <Text variant="bodySmall" style={{ color: theme.colors.subText }}>•</Text>
                <Text
                  variant="bodySmall"
                  style={[styles.notesText, { color: theme.colors.subText }]}
                  numberOfLines={1}
                >
                  {item.notes}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.rightCol}>
        <Text
          variant="titleMedium"
          style={[
            styles.amountText,
            { color: isIncome ? '#059669' : theme.colors.onSurface },
          ]}
        >
          {isIncome ? '+' : '-'}₹{item.amount.toLocaleString('en-IN')}
        </Text>

        {Boolean(onDelete) ? (
          <TouchableOpacity
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={onDelete}
            style={styles.deleteBtn}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={16} color="#94A3B8" />
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginVertical: 4,
  },
  leftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoWrapper: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  categoryTitle: {
    fontWeight: '700',
    fontSize: 15,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  paymentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  notesText: {
    flex: 1,
    fontSize: 12,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  amountText: {
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: -0.3,
  },
  deleteBtn: {
    padding: 2,
  },
});


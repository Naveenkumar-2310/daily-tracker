import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExtendedTheme } from '../../theme/theme';
import { IExpenseCategory } from '../../services/expenseApi';

export interface BankLedgerItem {
  id: string;
  type: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  amount: number;
  categoryId: string;
  categoryName: string;
  date: string;
  paymentMode: 'CASH' | 'UPI' | 'BANK' | 'CARD';
  accountName?: string;
  notes?: string;
  vehicleId?: string;
  fuelLogId?: string;
  runningBalance?: number;
}

interface BankPassbookLedgerProps {
  items: BankLedgerItem[];
  categoryMap: Map<string, IExpenseCategory>;
  onDeleteItem?: (id: string) => void;
}

export const BankPassbookLedger: React.FC<BankPassbookLedgerProps> = ({
  items,
  categoryMap,
  onDeleteItem,
}) => {
  const theme = useTheme<ExtendedTheme>();

  // Group items by date
  const groupedByDate: Record<string, BankLedgerItem[]> = {};
  for (const item of items) {
    if (!groupedByDate[item.date]) {
      groupedByDate[item.date] = [];
    }
    groupedByDate[item.date].push(item);
  }

  const sortedDates = Object.keys(groupedByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const formatDateHeader = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* Passbook Table Header */}
      <View
        style={[
          styles.ledgerHeader,
          {
            backgroundColor: theme.colors.surfaceVariant || '#F1F5F9',
            borderColor: theme.colors.cardBorder || theme.colors.outline,
          },
        ]}
      >
        <Text style={[styles.headerColLeft, { color: theme.colors.subText }]}>
          PARTICULARS & REFERENCE
        </Text>
        <Text style={[styles.headerColRight, { color: theme.colors.subText }]}>
          AMOUNT & BALANCE
        </Text>
      </View>

      {/* Date-Grouped Ledger Rows */}
      {sortedDates.map((dateKey) => {
        const dayItems = groupedByDate[dateKey];
        return (
          <View key={dateKey} style={styles.dateGroup}>
            {/* Date Ribbon */}
            <View style={styles.dateRibbon}>
              <View style={[styles.dateDot, { backgroundColor: theme.colors.primary }]} />
              <Text variant="labelSmall" style={[styles.dateText, { color: theme.colors.onSurface }]}>
                {formatDateHeader(dateKey)}
              </Text>
            </View>

            {/* Transactions inside this day */}
            <View
              style={[
                styles.groupCard,
                {
                  backgroundColor: theme.colors.cardBg || theme.colors.surface,
                  borderColor: theme.colors.cardBorder || theme.colors.outline,
                },
              ]}
            >
              {dayItems.map((tx, idx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isIncome = tx.type === 'INCOME';
                const isLast = idx === dayItems.length - 1;

                return (
                  <View
                    key={tx.id}
                    style={[
                      styles.ledgerRow,
                      !isLast && {
                        borderBottomColor: theme.colors.outlineVariant || '#F1F5F9',
                        borderBottomWidth: 1,
                      },
                    ]}
                  >
                    {/* Left: Particulars */}
                    <View style={styles.rowLeft}>
                      <View
                        style={[
                          styles.catIconWrap,
                          { backgroundColor: `${cat?.color || '#4F46E5'}15` },
                        ]}
                      >
                        <MaterialCommunityIcons
                          name={(cat?.icon as any) || 'tag'}
                          size={18}
                          color={cat?.color || theme.colors.primary}
                        />
                      </View>

                      <View style={styles.particulars}>
                        <Text
                          variant="titleSmall"
                          style={[styles.narration, { color: theme.colors.onSurface }]}
                          numberOfLines={1}
                        >
                          {tx.notes || tx.categoryName}
                        </Text>

                        <View style={styles.subMeta}>
                          <Text style={[styles.catName, { color: cat?.color || theme.colors.primary }]}>
                            {tx.categoryName}
                          </Text>
                          <Text style={styles.dotSeparator}>•</Text>
                          <Text style={[styles.modeBadge, { color: theme.colors.subText }]}>
                            {tx.paymentMode}
                          </Text>
                          {Boolean(tx.vehicleId) ? (
                            <>
                              <Text style={styles.dotSeparator}>•</Text>
                              <Text style={styles.fuelSyncBadge}>Fuel ⛽</Text>
                            </>
                          ) : null}
                        </View>
                      </View>
                    </View>

                    {/* Right: Amount & Running Balance */}
                    <View style={styles.rowRight}>
                      <View style={styles.amountBadgeRow}>
                        <Text
                          variant="titleMedium"
                          style={[
                            styles.amountText,
                            { color: isIncome ? '#059669' : theme.colors.onSurface },
                          ]}
                        >
                          {isIncome ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                        <View
                          style={[
                            styles.drCrBadge,
                            { backgroundColor: isIncome ? '#DCFCE7' : '#FEE2E2' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.drCrText,
                              { color: isIncome ? '#15803D' : '#B91C1C' },
                            ]}
                          >
                            {isIncome ? 'Cr' : 'Dr'}
                          </Text>
                        </View>
                      </View>

                      {tx.runningBalance !== undefined ? (
                        <Text style={[styles.balanceText, { color: theme.colors.subText }]}>
                          Bal: ₹{tx.runningBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Text>
                      ) : null}

                      {onDeleteItem ? (
                        <TouchableOpacity
                          onPress={() => onDeleteItem(tx.id)}
                          style={styles.deleteAction}
                          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                        >
                          <MaterialCommunityIcons name="trash-can-outline" size={14} color="#94A3B8" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  headerColLeft: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  headerColRight: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  dateGroup: {
    marginBottom: 14,
  },
  dateRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  dateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dateText: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  groupCard: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  catIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  particulars: {
    flex: 1,
  },
  narration: {
    fontWeight: '700',
    fontSize: 14,
  },
  subMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  catName: {
    fontSize: 11,
    fontWeight: '600',
  },
  dotSeparator: {
    fontSize: 10,
    color: '#94A3B8',
  },
  modeBadge: {
    fontSize: 11,
  },
  fuelSyncBadge: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '700',
  },
  rowRight: {
    alignItems: 'flex-end',
    gap: 2,
    marginLeft: 8,
  },
  amountBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountText: {
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: -0.3,
  },
  drCrBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  drCrText: {
    fontSize: 10,
    fontWeight: '800',
  },
  balanceText: {
    fontSize: 11,
    fontWeight: '500',
  },
  deleteAction: {
    marginTop: 2,
  },
});


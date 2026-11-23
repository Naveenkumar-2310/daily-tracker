import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExtendedTheme } from '../../theme/theme';
import { ResponsiveContainer } from '../../components/common/ResponsiveContainer';
import { PremiumMetricCard } from '../../components/common/PremiumMetricCard';
import { BudgetProgressBar } from '../../components/common/BudgetProgressBar';
import {
  ExpenseTransactionCard,
  ExpenseItemData,
} from '../../components/common/ExpenseTransactionCard';
import {
  expenseApi,
  IExpenseCategory,
  IExpenseItem,
  IExpenseSummary,
} from '../../services/expenseApi';
import { AddExpenseModal } from './AddExpenseModal';
import { SetBudgetModal } from './SetBudgetModal';

export const ExpenseHomeScreen: React.FC = () => {
  const theme = useTheme<ExtendedTheme>();

  // Date selection
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<IExpenseSummary | null>(null);
  const [expenses, setExpenses] = useState<IExpenseItem[]>([]);
  const [categories, setCategories] = useState<IExpenseCategory[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'FUEL'>('ALL');

  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sum, list, cats] = await Promise.all([
        expenseApi.getSummary(selectedMonth, selectedYear),
        expenseApi.getExpenses({ month: selectedMonth, year: selectedYear }),
        expenseApi.getCategories(),
      ]);
      setSummary(sum);
      setExpenses(list);
      setCategories(cats);
    } catch (err) {
      console.warn('Error loading expense data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear((y) => y - 1);
    } else {
      setSelectedMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear((y) => y + 1);
    } else {
      setSelectedMonth((m) => m + 1);
    }
  };

  const handleSaveTransaction = async (data: any) => {
    await expenseApi.createExpense(data);
    loadData();
  };

  const handleSaveBudget = async (overallBudget: number) => {
    await expenseApi.setBudget({
      month: selectedMonth,
      year: selectedYear,
      overallBudget,
    });
    loadData();
  };

  const handleDeleteExpense = async (id: string) => {
    const performDelete = async () => {
      await expenseApi.deleteExpense(id);
      loadData();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to delete this transaction?')) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Delete Transaction',
        'Are you sure you want to remove this record?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: performDelete },
        ]
      );
    }
  };

  // CSV Export for Web & Mobile
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      if (Platform.OS === 'web') {
        alert('No transactions to export for this month.');
      } else {
        Alert.alert('Notice', 'No transactions to export for this month.');
      }
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Category', 'Amount', 'Payment Mode', 'Notes', 'Fuel Log'];
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      e.type,
      `"${e.categoryName}"`,
      e.amount,
      e.paymentMode,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      e.fuelLogId ? 'Yes' : 'No',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Expenses_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert(
        'CSV Export Ready',
        `Generated CSV with ${expenses.length} records for ${monthNames[selectedMonth - 1]} ${selectedYear}.`
      );
    }
  };

  // Filter items
  const filteredExpenses = expenses.filter((e) => {
    if (activeFilter === 'EXPENSE') return e.type === 'EXPENSE';
    if (activeFilter === 'INCOME') return e.type === 'INCOME';
    if (activeFilter === 'FUEL') return !!e.vehicleId || !!e.fuelLogId;
    return true;
  });

  const categoryMap = new Map<string, IExpenseCategory>();
  for (const c of categories) {
    categoryMap.set(c.id, c);
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <ResponsiveContainer>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
          }
        >
          {/* Top Month Selector Bar */}
          <View style={[styles.monthBar, { backgroundColor: theme.colors.surface, borderColor: theme.colors.cardBorder || theme.colors.outline }]}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.monthNavBtn}>
              <MaterialCommunityIcons name="chevron-left" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>

            <View style={styles.monthCenter}>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                {monthNames[selectedMonth - 1]} {selectedYear}
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.subText }}>
                Financial Month Overview
              </Text>
            </View>

            <TouchableOpacity onPress={handleNextMonth} style={styles.monthNavBtn}>
              <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.onSurface} />
            </TouchableOpacity>
          </View>

          {loading && !refreshing ? (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              {/* Premium Financial Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricRow}>
                  <PremiumMetricCard
                    title="Total Income"
                    amount={summary?.totalIncome || 0}
                    icon="arrow-bottom-left"
                    accentColor="#059669"
                    trendText="Inflow"
                    trendPositive={true}
                  />
                  <PremiumMetricCard
                    title="Total Expenses"
                    amount={summary?.totalExpense || 0}
                    icon="arrow-top-right"
                    accentColor="#EF4444"
                    trendText="Outflow"
                    trendPositive={false}
                  />
                </View>

                <View style={styles.metricRow}>
                  <PremiumMetricCard
                    title="Net Savings"
                    amount={summary?.netSavings || 0}
                    subtitle={`${summary?.savingsRatePercentage || 0}% Savings Rate`}
                    icon="wallet-outline"
                    accentColor="#4F46E5"
                  />
                  <PremiumMetricCard
                    title="Budget Safe"
                    amount={summary?.remainingBudget || 0}
                    subtitle={`${summary?.budgetSpentPercentage || 0}% Used`}
                    icon="shield-check-outline"
                    accentColor="#D97706"
                    onPress={() => setBudgetModalVisible(true)}
                  />
                </View>
              </View>

              {/* Budget Progress Bar */}
              <View style={styles.sectionHeader}>
                <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                  Monthly Budget Control
                </Text>
                <TouchableOpacity
                  onPress={() => setBudgetModalVisible(true)}
                  style={styles.editBudgetPill}
                >
                  <MaterialCommunityIcons name="pencil-outline" size={14} color={theme.colors.primary} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: theme.colors.primary }}>
                    Adjust Target
                  </Text>
                </TouchableOpacity>
              </View>

              <BudgetProgressBar
                spent={summary?.totalExpense || 0}
                budget={summary?.overallBudget || 25000}
              />

              {/* Category Spending Breakdown */}
              {summary && summary.categoryBreakdown.length > 0 && (
                <View style={styles.categoriesSection}>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Top Spending by Category
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {summary.categoryBreakdown.map((cat) => (
                      <View
                        key={cat.categoryId}
                        style={[
                          styles.catBreakdownCard,
                          {
                            backgroundColor: theme.colors.cardBg || theme.colors.surface,
                            borderColor: theme.colors.cardBorder || theme.colors.outline,
                          },
                        ]}
                      >
                        <View style={[styles.catIconBox, { backgroundColor: `${cat.color}18` }]}>
                          <MaterialCommunityIcons name={(cat.icon as any) || 'tag'} size={20} color={cat.color} />
                        </View>
                        <Text variant="bodySmall" style={{ fontWeight: '700', color: theme.colors.onSurface }} numberOfLines={1}>
                          {cat.categoryName}
                        </Text>
                        <Text variant="titleSmall" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                          ₹{cat.amount.toLocaleString('en-IN')}
                        </Text>
                        <View style={[styles.pctBadge, { backgroundColor: `${cat.color}15` }]}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: cat.color }}>
                            {cat.percentage}% of spend
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}

              {/* Action Bar (Filters + Export) */}
              <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {[
                    { id: 'ALL', label: 'All Records' },
                    { id: 'EXPENSE', label: 'Expenses' },
                    { id: 'INCOME', label: 'Income' },
                    { id: 'FUEL', label: 'Fuel Synced ⛽' },
                  ].map((f) => (
                    <TouchableOpacity
                      key={f.id}
                      onPress={() => setActiveFilter(f.id as any)}
                      style={[
                        styles.filterChip,
                        {
                          backgroundColor: activeFilter === f.id ? theme.colors.primary : (theme.colors.surfaceVariant || '#F1F5F9'),
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          {
                            color: activeFilter === f.id ? '#FFFFFF' : theme.colors.onSurface,
                            fontWeight: activeFilter === f.id ? '700' : '500',
                          },
                        ]}
                      >
                        {f.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity onPress={handleExportCSV} style={styles.exportBtn}>
                  <MaterialCommunityIcons name="file-excel-outline" size={18} color="#059669" />
                  <Text style={styles.exportBtnText}>Export</Text>
                </TouchableOpacity>
              </View>

              {/* Transaction List */}
              <View style={styles.transactionsHeader}>
                <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                  Transactions ({filteredExpenses.length})
                </Text>
                <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.quickAddHeaderBtn}>
                  <MaterialCommunityIcons name="plus-circle" size={16} color={theme.colors.primary} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.primary }}>
                    Add New
                  </Text>
                </TouchableOpacity>
              </View>

              {filteredExpenses.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: theme.colors.cardBg || theme.colors.surface,
                      borderColor: theme.colors.cardBorder || theme.colors.outline,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="wallet-outline" size={48} color={theme.colors.subText} />
                  <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface, marginTop: 12 }}>
                    No Transactions Recorded
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.subText, textAlign: 'center', marginHorizontal: 20 }}>
                    Log your daily spending, income, or refueling to keep your financial track crystal clear.
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddModalVisible(true)}
                    style={[styles.emptyAddBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Record First Transaction</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                filteredExpenses.map((item) => {
                  const cat = categoryMap.get(item.categoryId);
                  return (
                    <ExpenseTransactionCard
                      key={item.id}
                      item={item as ExpenseItemData}
                      categoryIcon={cat?.icon || 'tag'}
                      categoryColor={cat?.color || '#4F46E5'}
                      onDelete={() => handleDeleteExpense(item.id)}
                    />
                  );
                })
              )}
            </>
          )}
        </ScrollView>
      </ResponsiveContainer>

      {/* Floating Action Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setAddModalVisible(true)}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Modals */}
      <AddExpenseModal
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
        categories={categories}
        onSave={handleSaveTransaction}
      />

      <SetBudgetModal
        visible={budgetModalVisible}
        onDismiss={() => setBudgetModalVisible(false)}
        currentBudget={summary?.overallBudget || 25000}
        month={selectedMonth}
        year={selectedYear}
        onSave={handleSaveBudget}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 90,
  },
  monthBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  monthNavBtn: {
    padding: 6,
    borderRadius: 12,
  },
  monthCenter: {
    alignItems: 'center',
  },
  loaderContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  metricsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  editBudgetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  categoriesSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: '800',
    marginBottom: 10,
  },
  categoryScroll: {
    gap: 10,
  },
  catBreakdownCard: {
    width: 130,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 4,
    alignItems: 'flex-start',
  },
  catIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 2,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
    gap: 8,
  },
  filterScroll: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipText: {
    fontSize: 12,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAddHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 8,
    gap: 8,
  },
  emptyAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});


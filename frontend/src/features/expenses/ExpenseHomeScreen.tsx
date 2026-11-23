import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { Text, TextInput, useTheme, ActivityIndicator } from 'react-native-paper';
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
  BankPassbookLedger,
  BankLedgerItem,
} from '../../components/common/BankPassbookLedger';
import {
  expenseApi,
  IExpenseCategory,
  IExpenseItem,
  IExpenseSummary,
} from '../../services/expenseApi';
import { AddExpenseModal } from './AddExpenseModal';
import { SetBudgetModal } from './SetBudgetModal';

export type SortKey =
  | 'DATE_DESC'
  | 'DATE_ASC'
  | 'AMOUNT_DESC'
  | 'AMOUNT_ASC'
  | 'CATEGORY_ASC'
  | 'CATEGORY_DESC'
  | 'TYPE_EXPENSE'
  | 'TYPE_INCOME';

export type ViewMode = 'BANK' | 'CARD';

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

  // Filtering & Sorting
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'EXPENSE' | 'INCOME' | 'FUEL'>('ALL');
  const [sortBy, setSortBy] = useState<SortKey>('DATE_DESC');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('BANK');

  // Modals
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const sortOptions: Array<{ key: SortKey; label: string; icon: string }> = [
    { key: 'DATE_DESC', label: 'Date: Newest First', icon: 'calendar-arrow-right' },
    { key: 'DATE_ASC', label: 'Date: Oldest First', icon: 'calendar-arrow-left' },
    { key: 'AMOUNT_DESC', label: 'Amount: Highest First', icon: 'sort-numeric-descending' },
    { key: 'AMOUNT_ASC', label: 'Amount: Lowest First', icon: 'sort-numeric-ascending' },
    { key: 'CATEGORY_ASC', label: 'Category: A to Z', icon: 'sort-alphabetical-ascending' },
    { key: 'CATEGORY_DESC', label: 'Category: Z to A', icon: 'sort-alphabetical-descending' },
    { key: 'TYPE_EXPENSE', label: 'Expenses (Debits) First', icon: 'arrow-top-right' },
    { key: 'TYPE_INCOME', label: 'Income (Credits) First', icon: 'arrow-bottom-left' },
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
      link.setAttribute('download', `BankStatement_${monthNames[selectedMonth - 1]}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      Alert.alert(
        'Passbook Statement Export Ready',
        `Generated CSV with ${expenses.length} records for ${monthNames[selectedMonth - 1]} ${selectedYear}.`
      );
    }
  };

  const categoryMap = useMemo(() => {
    const map = new Map<string, IExpenseCategory>();
    for (const c of categories) {
      map.set(c.id, c);
    }
    return map;
  }, [categories]);

  // Compute running balance & apply filters & sorting
  const processedTransactions = useMemo(() => {
    // 1. Calculate running balances in chronological order
    const chrono = [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let currentBalance = 0;
    const balanceMap = new Map<string, number>();

    for (const tx of chrono) {
      if (tx.type === 'INCOME') {
        currentBalance += tx.amount;
      } else if (tx.type === 'EXPENSE') {
        currentBalance -= tx.amount;
      }
      balanceMap.set(tx.id, currentBalance);
    }

    // 2. Filter
    let list = expenses.map((tx) => ({
      ...tx,
      runningBalance: balanceMap.get(tx.id) ?? 0,
    }));

    if (activeFilter === 'EXPENSE') {
      list = list.filter((e) => e.type === 'EXPENSE');
    } else if (activeFilter === 'INCOME') {
      list = list.filter((e) => e.type === 'INCOME');
    } else if (activeFilter === 'FUEL') {
      list = list.filter((e) => !!e.vehicleId || !!e.fuelLogId);
    }

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.categoryName.toLowerCase().includes(q) ||
          e.notes?.toLowerCase().includes(q) ||
          e.paymentMode.toLowerCase().includes(q) ||
          String(e.amount).includes(q)
      );
    }

    // 4. Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'DATE_ASC':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'DATE_DESC':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'AMOUNT_DESC':
          return b.amount - a.amount;
        case 'AMOUNT_ASC':
          return a.amount - b.amount;
        case 'CATEGORY_ASC':
          return a.categoryName.localeCompare(b.categoryName);
        case 'CATEGORY_DESC':
          return b.categoryName.localeCompare(a.categoryName);
        case 'TYPE_EXPENSE':
          return a.type === 'EXPENSE' ? -1 : 1;
        case 'TYPE_INCOME':
          return a.type === 'INCOME' ? -1 : 1;
        default:
          return 0;
      }
    });

    return list;
  }, [expenses, activeFilter, searchQuery, sortBy]);

  const activeSortLabel = sortOptions.find((s) => s.key === sortBy)?.label || 'Date: Newest';

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
              {Boolean(summary && summary.categoryBreakdown && summary.categoryBreakdown.length > 0) ? (
                <View style={styles.categoriesSection}>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
                    Top Spending by Category
                  </Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {summary!.categoryBreakdown.map((cat) => (
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
              ) : null}

              {/* Search & Ledger Controls Bar */}
              <View style={styles.searchBarWrapper}>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search description, category, mode..."
                  mode="outlined"
                  left={<TextInput.Icon icon="magnify" color={theme.colors.subText} />}
                  right={searchQuery ? <TextInput.Icon icon="close-circle" onPress={() => setSearchQuery('')} /> : undefined}
                  style={styles.searchInput}
                  outlineColor={theme.colors.outline}
                  activeOutlineColor={theme.colors.primary}
                  dense
                />
              </View>

              {/* View Switcher & Sort Toolbar */}
              <View style={styles.toolbarRow}>
                {/* View Switcher: Bank Passbook vs Cards */}
                <View style={[styles.viewSwitcher, { backgroundColor: theme.colors.surfaceVariant || '#F1F5F9' }]}>
                  <TouchableOpacity
                    onPress={() => setViewMode('BANK')}
                    style={[
                      styles.viewTab,
                      viewMode === 'BANK' && [styles.viewTabActive, { backgroundColor: theme.colors.surface }],
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="book-open-page-variant-outline"
                      size={15}
                      color={viewMode === 'BANK' ? theme.colors.primary : theme.colors.subText}
                    />
                    <Text
                      style={[
                        styles.viewTabText,
                        { color: viewMode === 'BANK' ? theme.colors.primary : theme.colors.subText },
                      ]}
                    >
                      Bank Passbook
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setViewMode('CARD')}
                    style={[
                      styles.viewTab,
                      viewMode === 'CARD' && [styles.viewTabActive, { backgroundColor: theme.colors.surface }],
                    ]}
                  >
                    <MaterialCommunityIcons
                      name="view-list"
                      size={16}
                      color={viewMode === 'CARD' ? theme.colors.primary : theme.colors.subText}
                    />
                    <Text
                      style={[
                        styles.viewTabText,
                        { color: viewMode === 'CARD' ? theme.colors.primary : theme.colors.subText },
                      ]}
                    >
                      Cards
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Sort Button */}
                <TouchableOpacity
                  onPress={() => setSortModalVisible(true)}
                  style={[
                    styles.sortPillBtn,
                    {
                      backgroundColor: theme.colors.cardBg || theme.colors.surface,
                      borderColor: theme.colors.cardBorder || theme.colors.outline,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="sort" size={16} color={theme.colors.primary} />
                  <Text style={[styles.sortPillText, { color: theme.colors.onSurface }]} numberOfLines={1}>
                    {activeSortLabel}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={16} color={theme.colors.subText} />
                </TouchableOpacity>
              </View>

              {/* Filter Pills Bar */}
              <View style={styles.filterBar}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                  {[
                    { id: 'ALL', label: 'All Records' },
                    { id: 'EXPENSE', label: 'Debits (Expenses)' },
                    { id: 'INCOME', label: 'Credits (Income)' },
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
                  <Text style={styles.exportBtnText}>Statement</Text>
                </TouchableOpacity>
              </View>

              {/* Transactions Content */}
              <View style={styles.transactionsHeader}>
                <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                  {viewMode === 'BANK' ? 'Bank Account Passbook' : 'Transaction Records'} ({processedTransactions.length})
                </Text>
                <TouchableOpacity onPress={() => setAddModalVisible(true)} style={styles.quickAddHeaderBtn}>
                  <MaterialCommunityIcons name="plus-circle" size={16} color={theme.colors.primary} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: theme.colors.primary }}>
                    Add Record
                  </Text>
                </TouchableOpacity>
              </View>

              {processedTransactions.length === 0 ? (
                <View
                  style={[
                    styles.emptyState,
                    {
                      backgroundColor: theme.colors.cardBg || theme.colors.surface,
                      borderColor: theme.colors.cardBorder || theme.colors.outline,
                    },
                  ]}
                >
                  <MaterialCommunityIcons name="book-open-outline" size={48} color={theme.colors.subText} />
                  <Text variant="titleMedium" style={{ fontWeight: '700', color: theme.colors.onSurface, marginTop: 12 }}>
                    No Entries Found
                  </Text>
                  <Text variant="bodySmall" style={{ color: theme.colors.subText, textAlign: 'center', marginHorizontal: 20 }}>
                    {searchQuery ? 'No transactions match your search filter.' : 'Log your daily spending, salary, or refueling to populate your statement.'}
                  </Text>
                  <TouchableOpacity
                    onPress={() => setAddModalVisible(true)}
                    style={[styles.emptyAddBtn, { backgroundColor: theme.colors.primary }]}
                  >
                    <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                    <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Record First Transaction</Text>
                  </TouchableOpacity>
                </View>
              ) : viewMode === 'BANK' ? (
                /* Bank Passbook Ledger View */
                <BankPassbookLedger
                  items={processedTransactions as BankLedgerItem[]}
                  categoryMap={categoryMap}
                  onDeleteItem={handleDeleteExpense}
                />
              ) : (
                /* Standard Card View */
                processedTransactions.map((item) => {
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

      {/* Add Transaction Modal */}
      <AddExpenseModal
        visible={addModalVisible}
        onDismiss={() => setAddModalVisible(false)}
        categories={categories}
        onSave={handleSaveTransaction}
      />

      {/* Set Budget Modal */}
      <SetBudgetModal
        visible={budgetModalVisible}
        onDismiss={() => setBudgetModalVisible(false)}
        currentBudget={summary?.overallBudget || 25000}
        month={selectedMonth}
        year={selectedYear}
        onSave={handleSaveBudget}
      />

      {/* Sort Selection Modal */}
      <Modal
        visible={sortModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSortModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSortModalVisible(false)}
        >
          <View
            style={[
              styles.sortModalCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.cardBorder || theme.colors.outline,
              },
            ]}
          >
            <View style={styles.sortModalHeader}>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                Sort Transactions By
              </Text>
              <TouchableOpacity onPress={() => setSortModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={20} color={theme.colors.subText} />
              </TouchableOpacity>
            </View>

            <View style={styles.sortList}>
              {sortOptions.map((opt) => {
                const isSelected = opt.key === sortBy;
                return (
                  <TouchableOpacity
                    key={opt.key}
                    onPress={() => {
                      setSortBy(opt.key);
                      setSortModalVisible(false);
                    }}
                    style={[
                      styles.sortOptionItem,
                      isSelected && {
                        backgroundColor: `${theme.colors.primary}12`,
                      },
                    ]}
                  >
                    <View style={styles.sortItemLeft}>
                      <MaterialCommunityIcons
                        name={opt.icon as any}
                        size={20}
                        color={isSelected ? theme.colors.primary : theme.colors.subText}
                      />
                      <Text
                        style={[
                          styles.sortItemLabel,
                          {
                            color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                            fontWeight: isSelected ? '700' : '500',
                          },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </View>

                    {isSelected ? (
                      <MaterialCommunityIcons name="check" size={18} color={theme.colors.primary} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
  searchBarWrapper: {
    marginTop: 12,
    marginBottom: 8,
  },
  searchInput: {
    backgroundColor: 'transparent',
    fontSize: 13,
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    gap: 8,
  },
  viewSwitcher: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
  },
  viewTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  viewTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sortPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'space-between',
  },
  sortPillText: {
    fontSize: 11,
    fontWeight: '700',
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    padding: 20,
  },
  sortModalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
  },
  sortModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.15)',
  },
  sortList: {
    gap: 4,
  },
  sortOptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  sortItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sortItemLabel: {
    fontSize: 13,
  },
});

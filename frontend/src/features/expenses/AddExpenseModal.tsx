import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExtendedTheme } from '../../theme/theme';
import { IExpenseCategory } from '../../services/expenseApi';

interface AddExpenseModalProps {
  visible: boolean;
  onDismiss: () => void;
  categories: IExpenseCategory[];
  onSave: (data: {
    type: 'EXPENSE' | 'INCOME';
    amount: number;
    categoryId: string;
    date: string;
    paymentMode: 'CASH' | 'UPI' | 'BANK' | 'CARD';
    notes?: string;
  }) => Promise<void>;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  visible,
  onDismiss,
  categories,
  onSave,
}) => {
  const theme = useTheme<ExtendedTheme>();
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [amountStr, setAmountStr] = useState('');
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'BANK' | 'CARD'>('UPI');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter((c) => c.type === type);
  const activeCatId = selectedCatId || filteredCategories[0]?.id || '';

  const handleQuickAdd = (add: number) => {
    const current = parseFloat(amountStr) || 0;
    setAmountStr(String(current + add));
  };

  const handleSubmit = async () => {
    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) return;

    try {
      setIsSubmitting(true);
      const today = new Date().toISOString().split('T')[0];
      await onSave({
        type,
        amount,
        categoryId: activeCatId,
        date: today,
        paymentMode,
        notes: notes.trim() || undefined,
      });
      setAmountStr('');
      setNotes('');
      onDismiss();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

        <View
          style={[
            styles.sheet,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.cardBorder || theme.colors.outline,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text variant="titleLarge" style={[styles.title, { color: theme.colors.onSurface }]}>
                Add Transaction
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.subText }}>
                Record money in or out in real-time
              </Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={22} color={theme.colors.subText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* Type Switcher */}
            <View style={styles.typeSwitcher}>
              <TouchableOpacity
                onPress={() => setType('EXPENSE')}
                style={[
                  styles.typeTab,
                  type === 'EXPENSE' && {
                    backgroundColor: '#EF4444',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="arrow-top-right"
                  size={18}
                  color={type === 'EXPENSE' ? '#FFFFFF' : theme.colors.subText}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'EXPENSE' ? '#FFFFFF' : theme.colors.subText },
                  ]}
                >
                  Expense (Money Out)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setType('INCOME')}
                style={[
                  styles.typeTab,
                  type === 'INCOME' && {
                    backgroundColor: '#10B981',
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="arrow-bottom-left"
                  size={18}
                  color={type === 'INCOME' ? '#FFFFFF' : theme.colors.subText}
                />
                <Text
                  style={[
                    styles.typeTabText,
                    { color: type === 'INCOME' ? '#FFFFFF' : theme.colors.subText },
                  ]}
                >
                  Income (Money In)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Amount Field */}
            <View style={styles.amountContainer}>
              <Text style={[styles.currencyPrefix, { color: type === 'EXPENSE' ? '#EF4444' : '#10B981' }]}>
                ₹
              </Text>
              <TextInput
                value={amountStr}
                onChangeText={setAmountStr}
                placeholder="0"
                keyboardType="numeric"
                style={styles.amountInput}
                textColor={theme.colors.onSurface}
                autoFocus
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.quickChipsRow}>
              {[100, 500, 1000, 2000].map((val) => (
                <TouchableOpacity
                  key={val}
                  onPress={() => handleQuickAdd(val)}
                  style={[
                    styles.quickChip,
                    {
                      backgroundColor: theme.colors.surfaceVariant || '#F1F5F9',
                      borderColor: theme.colors.outline,
                    },
                  ]}
                >
                  <Text style={[styles.quickChipText, { color: theme.colors.onSurface }]}>
                    +₹{val}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Category Section */}
            <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
              Select Category
            </Text>
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((cat) => {
                const isSelected = cat.id === activeCatId;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCatId(cat.id)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected ? `${cat.color}20` : (theme.colors.surfaceVariant || '#F8FAFC'),
                        borderColor: isSelected ? cat.color : theme.colors.outline,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={(cat.icon as any) || 'tag'}
                      size={18}
                      color={isSelected ? cat.color : theme.colors.subText}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        {
                          color: isSelected ? cat.color : theme.colors.onSurface,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Payment Mode */}
            <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
              Payment Mode
            </Text>
            <View style={styles.paymentModesRow}>
              {(['UPI', 'CASH', 'BANK', 'CARD'] as const).map((mode) => {
                const isSelected = paymentMode === mode;
                const modeIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
                  UPI: 'qrcode-scan',
                  CASH: 'cash',
                  BANK: 'bank',
                  CARD: 'credit-card-outline',
                };
                return (
                  <TouchableOpacity
                    key={mode}
                    onPress={() => setPaymentMode(mode)}
                    style={[
                      styles.modeChip,
                      {
                        backgroundColor: isSelected ? theme.colors.primaryContainer : (theme.colors.surfaceVariant || '#F8FAFC'),
                        borderColor: isSelected ? theme.colors.primary : theme.colors.outline,
                      },
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={modeIcons[mode]}
                      size={16}
                      color={isSelected ? theme.colors.primary : theme.colors.subText}
                    />
                    <Text
                      style={[
                        styles.modeChipText,
                        {
                          color: isSelected ? theme.colors.primary : theme.colors.onSurface,
                          fontWeight: isSelected ? '700' : '500',
                        },
                      ]}
                    >
                      {mode}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Notes */}
            <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurface }]}>
              Note / Description (Optional)
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="e.g. Dinner with team, Grocery shopping"
              mode="outlined"
              style={styles.notesInput}
              outlineColor={theme.colors.outline}
              activeOutlineColor={theme.colors.primary}
            />

            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting || !amountStr || parseFloat(amountStr) <= 0}
              style={[
                styles.submitButton,
                {
                  backgroundColor: type === 'EXPENSE' ? '#EF4444' : '#10B981',
                },
              ]}
              contentStyle={styles.submitButtonContent}
              labelStyle={styles.submitButtonLabel}
            >
              Save {type === 'EXPENSE' ? 'Expense' : 'Income'}
            </Button>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: '90%',
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontWeight: '800',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  scroll: {
    maxHeight: 520,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 4,
  },
  typeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  typeTabText: {
    fontWeight: '700',
    fontSize: 13,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  currencyPrefix: {
    fontSize: 34,
    fontWeight: '800',
    marginRight: 6,
  },
  amountInput: {
    fontSize: 38,
    fontWeight: '900',
    backgroundColor: 'transparent',
    minWidth: 140,
    textAlign: 'center',
  },
  quickChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontWeight: '700',
    fontSize: 13,
    marginTop: 14,
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  categoryChipText: {
    fontSize: 12,
  },
  paymentModesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  modeChipText: {
    fontSize: 12,
  },
  notesInput: {
    marginBottom: 20,
  },
  submitButton: {
    borderRadius: 14,
    marginVertical: 8,
  },
  submitButtonContent: {
    paddingVertical: 6,
  },
  submitButtonLabel: {
    fontWeight: '800',
    fontSize: 16,
    color: '#FFFFFF',
  },
});

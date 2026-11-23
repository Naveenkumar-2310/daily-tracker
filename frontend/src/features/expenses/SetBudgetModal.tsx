import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, TextInput, Button, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ExtendedTheme } from '../../theme/theme';

interface SetBudgetModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentBudget: number;
  month: number;
  year: number;
  onSave: (overallBudget: number) => Promise<void>;
}

export const SetBudgetModal: React.FC<SetBudgetModalProps> = ({
  visible,
  onDismiss,
  currentBudget,
  month,
  year,
  onSave,
}) => {
  const theme = useTheme<ExtendedTheme>();
  const [budgetStr, setBudgetStr] = useState(currentBudget ? String(currentBudget) : '25000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const presets = [15000, 25000, 40000, 60000];

  const handleSubmit = async () => {
    const val = parseFloat(budgetStr);
    if (isNaN(val) || val < 0) return;

    try {
      setIsSubmitting(true);
      await onSave(val);
      onDismiss();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      hardwareAccelerated={true}
      onRequestClose={onDismiss}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onDismiss} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.cardBorder || theme.colors.outline,
            },
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text variant="titleMedium" style={{ fontWeight: '800', color: theme.colors.onSurface }}>
                Set Monthly Budget Target
              </Text>
              <Text variant="bodySmall" style={{ color: theme.colors.subText }}>
                {monthNames[month - 1]} {year}
              </Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeBtn}>
              <MaterialCommunityIcons name="close" size={20} color={theme.colors.subText} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={[styles.currencyPrefix, { color: theme.colors.primary }]}>₹</Text>
            <TextInput
              value={budgetStr}
              onChangeText={setBudgetStr}
              keyboardType="numeric"
              placeholder="0"
              style={styles.input}
              textColor={theme.colors.onSurface}
              autoFocus
            />
          </View>

          {/* Quick Preset Buttons */}
          <View style={styles.presetRow}>
            {presets.map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setBudgetStr(String(p))}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: theme.colors.surfaceVariant || '#F1F5F9',
                    borderColor: theme.colors.outline,
                  },
                ]}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.onSurface }}>
                  ₹{(p / 1000).toFixed(0)}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            contentStyle={{ paddingVertical: 4 }}
            labelStyle={{ fontWeight: '700', fontSize: 15 }}
          >
            Update Target
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    padding: 20,
    ...(Platform.OS === 'web'
      ? ({
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 99999,
        } as any)
      : {}),
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  currencyPrefix: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: 6,
  },
  input: {
    fontSize: 34,
    fontWeight: '900',
    backgroundColor: 'transparent',
    minWidth: 140,
    textAlign: 'center',
  },
  presetRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  saveBtn: {
    borderRadius: 12,
  },
});

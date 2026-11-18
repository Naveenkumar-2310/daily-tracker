import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Portal, Dialog, Button, RadioButton, HelperText, useTheme } from 'react-native-paper';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export interface DropdownOption {
  label: string;
  value: string;
  icon?: string;
  subtitle?: string;
}

export interface AppDropdownProps {
  label: string;
  value: string;
  options: DropdownOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  icon?: string;
}

export const AppDropdown: React.FC<AppDropdownProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  helperText,
  error,
  icon,
}) => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  const handleSelect = (val: string) => {
    onSelect(val);
    setVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text variant="labelMedium" style={styles.label}>
        {label}
      </Text>

      <TouchableOpacity
        style={[
          styles.triggerButton,
          { borderColor: error ? '#EF4444' : '#CBD5E1', backgroundColor: '#FFFFFF' },
        ]}
        onPress={() => setVisible(true)}
        activeOpacity={0.8}
      >
        <View style={styles.leftContent}>
          {icon && (
            <MaterialCommunityIcons
              name={icon as any}
              size={20}
              color={error ? '#EF4444' : '#64748B'}
              style={{ marginRight: 8 }}
            />
          )}
          {selectedOption?.icon && !icon && (
            <MaterialCommunityIcons
              name={selectedOption.icon as any}
              size={20}
              color="#4F46E5"
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            variant="bodyMedium"
            style={[
              styles.valueText,
              !selectedOption && { color: '#94A3B8' },
            ]}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </Text>
        </View>

        <MaterialCommunityIcons name="chevron-down" size={22} color="#64748B" />
      </TouchableOpacity>

      {error ? (
        <HelperText type="error" visible={true} style={styles.helperText}>
          {error}
        </HelperText>
      ) : helperText ? (
        <Text variant="bodySmall" style={styles.subHelperText}>
          {helperText}
        </Text>
      ) : null}

      <Portal>
        <Dialog
          visible={visible}
          onDismiss={() => setVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title style={styles.dialogTitle}>{label}</Dialog.Title>
          <Dialog.ScrollArea style={styles.scrollArea}>
            <ScrollView contentContainerStyle={styles.optionsList}>
              {options.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <TouchableOpacity
                    key={opt.value}
                    style={[
                      styles.optionRow,
                      isSelected && styles.optionRowSelected,
                    ]}
                    onPress={() => handleSelect(opt.value)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.optionLeft}>
                      {opt.icon && (
                        <MaterialCommunityIcons
                          name={opt.icon as any}
                          size={22}
                          color={isSelected ? '#4F46E5' : '#64748B'}
                          style={{ marginRight: 12 }}
                        />
                      )}
                      <View>
                        <Text
                          style={[
                            styles.optionLabel,
                            isSelected && styles.optionLabelSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                        {opt.subtitle && (
                          <Text style={styles.optionSubtitle}>{opt.subtitle}</Text>
                        )}
                      </View>
                    </View>

                    <RadioButton
                      value={opt.value}
                      status={isSelected ? 'checked' : 'unchecked'}
                      onPress={() => handleSelect(opt.value)}
                      color="#4F46E5"
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)} textColor="#64748B">
              Cancel
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  triggerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  valueText: {
    fontWeight: '600',
    color: '#0F172A',
    fontSize: 14,
  },
  helperText: {
    paddingHorizontal: 0,
    marginTop: 2,
  },
  subHelperText: {
    color: '#64748B',
    marginTop: 4,
    fontSize: 11,
  },
  dialog: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    maxHeight: '80%',
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    paddingBottom: 4,
  },
  scrollArea: {
    paddingHorizontal: 0,
    maxHeight: 380,
  },
  optionsList: {
    paddingVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionRowSelected: {
    backgroundColor: '#EEF2FF',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },
  optionLabelSelected: {
    fontWeight: '800',
    color: '#4F46E5',
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
});


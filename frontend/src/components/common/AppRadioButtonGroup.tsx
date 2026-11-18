import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, TouchableOpacity } from 'react-native';
import { RadioButton, Text, useTheme } from 'react-native-paper';

export interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

export interface AppRadioButtonGroupProps {
  label?: string;
  value: string;
  onValueChange: (value: string) => void;
  options: RadioOption[];
  direction?: 'row' | 'column';
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppRadioButtonGroup: React.FC<AppRadioButtonGroupProps> = ({
  label,
  value,
  onValueChange,
  options,
  direction = 'column',
  containerStyle,
}) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text variant="titleSmall" style={styles.label}>{label}</Text>}
      <RadioButton.Group onValueChange={onValueChange} value={value}>
        <View style={direction === 'row' ? styles.rowLayout : styles.columnLayout}>
          {options.map((opt) => {
            const isSelected = value === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.optionItem,
                  direction === 'row' && styles.rowOptionItem,
                  isSelected && { borderColor: theme.colors.primary, backgroundColor: '#E3F2FD' },
                ]}
                onPress={() => onValueChange(opt.value)}
                activeOpacity={0.7}
              >
                <RadioButton.Android
                  value={opt.value}
                  color={theme.colors.primary}
                  uncheckedColor="#9E9E9E"
                />
                <View style={styles.textContainer}>
                  <Text
                    variant="bodyMedium"
                    style={[styles.optionLabel, isSelected && { color: theme.colors.primary, fontWeight: 'bold' }]}
                  >
                    {opt.label}
                  </Text>
                  {opt.description && (
                    <Text variant="bodySmall" style={styles.optionDescription}>
                      {opt.description}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </RadioButton.Group>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    marginBottom: 6,
    color: '#37474F',
    fontWeight: '600',
  },
  columnLayout: {
    flexDirection: 'column',
    gap: 6,
  },
  rowLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ECEFF1',
    backgroundColor: '#FAFAFA',
  },
  rowOptionItem: {
    flex: 1,
    minWidth: 110,
  },
  textContainer: {
    marginLeft: 4,
    flexShrink: 1,
  },
  optionLabel: {
    color: '#263238',
  },
  optionDescription: {
    color: '#78909C',
    fontSize: 11,
  },
});


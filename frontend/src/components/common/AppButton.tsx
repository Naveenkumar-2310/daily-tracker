import React from 'react';
import { StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Button, useTheme } from 'react-native-paper';

export interface AppButtonProps extends React.ComponentProps<typeof Button> {
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppButton: React.FC<AppButtonProps> = ({
  mode = 'contained',
  style,
  containerStyle,
  children,
  ...props
}) => {
  const theme = useTheme();

  return (
    <Button
      mode={mode}
      style={[
        styles.button,
        mode === 'contained' && { backgroundColor: theme.colors.primary },
        mode === 'outlined' && { borderColor: '#E2E8F0' },
        style,
      ]}
      labelStyle={styles.label}
      {...props}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 5,
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

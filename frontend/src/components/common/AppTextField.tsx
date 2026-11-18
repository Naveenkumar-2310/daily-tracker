import React from "react";
import { View, StyleSheet, StyleProp, ViewStyle } from "react-native";
import { TextInput, HelperText, useTheme } from "react-native-paper";

export interface AppTextFieldProps extends React.ComponentProps<
  typeof TextInput
> {
  errorText?: string;
  isError?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  helperText?: string;
}

export const AppTextField: React.FC<AppTextFieldProps> & {
  Icon: typeof TextInput.Icon;
  Affix: typeof TextInput.Affix;
} = Object.assign(
  ({
    errorText,
    isError = false,
    containerStyle,
    helperText,
    mode = "outlined",
    style,
    ...props
  }: AppTextFieldProps) => {
    const theme = useTheme();
    const hasError = isError || Boolean(errorText);

    return (
      <View style={[styles.container, containerStyle]}>
        <TextInput
          mode={mode}
          error={hasError}
          style={[styles.input, style]}
          outlineColor="#E2E8F0"
          activeOutlineColor={theme.colors.primary}
          outlineStyle={styles.outline}
          textColor="#0F172A"
          {...props}
        />
        {hasError ? (
          <HelperText type="error" visible={hasError} style={styles.helper}>
            {errorText}
          </HelperText>
        ) : helperText ? (
          <HelperText type="info" visible={true} style={styles.helper}>
            {helperText}
          </HelperText>
        ) : null}
      </View>
    );
  },
  {
    Icon: TextInput.Icon,
    Affix: TextInput.Affix,
  },
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    width: "100%",
  },
  input: {
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },
  outline: {
    borderRadius: 12,
  },
  helper: {
    paddingHorizontal: 4,
    marginTop: -2,
    fontSize: 12,
  },
});

import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 1040,
  style,
}) => {
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.outer, isWeb && styles.webOuter]}>
      <View style={[styles.inner, isWeb && { maxWidth }, style]}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
  },
  webOuter: {
    alignItems: 'center',
    width: '100%',
  },
  inner: {
    flex: 1,
    width: '100%',
  },
});


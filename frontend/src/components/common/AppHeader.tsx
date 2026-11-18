import React from 'react';
import { Appbar } from 'react-native-paper';
import { StyleSheet } from 'react-native';

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  onMenu?: () => void;
  actions?: Array<{
    icon: string;
    onPress: () => void;
  }>;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  onMenu,
  actions = [],
}) => {
  return (
    <Appbar.Header style={styles.header}>
      {onBack ? (
        <Appbar.BackAction onPress={onBack} color="#0F172A" />
      ) : onMenu ? (
        <Appbar.Action icon="menu" onPress={onMenu} color="#0F172A" />
      ) : null}
      <Appbar.Content
        title={title}
        subtitle={subtitle}
        titleStyle={styles.title}
        subtitleStyle={styles.subtitle}
      />
      {actions.map((act, index) => (
        <Appbar.Action key={index} icon={act.icon} onPress={act.onPress} color="#0F172A" />
      ))}
    </Appbar.Header>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    elevation: 0,
    height: 60,
  },
  title: {
    fontWeight: '800',
    fontSize: 18,
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: -2,
  },
});

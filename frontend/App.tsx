import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { GlobalUiProvider } from './src/context/GlobalUiContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { LaunchSplash } from './src/components/common/LaunchSplash';
import { queryClient } from './src/api/queryClient';
import { NotificationService } from './src/services/notificationService';

function MainApp() {
  const { theme } = useAppTheme();
  const [showLaunchIntro, setShowLaunchIntro] = React.useState(true);

  React.useEffect(() => {
    NotificationService.setupPermissionsAndChannels();
  }, []);

  const navTheme = theme.isDark
    ? {
        ...NavDarkTheme,
        colors: {
          ...NavDarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.outline,
          primary: theme.colors.primary,
        },
      }
    : {
        ...NavDefaultTheme,
        colors: {
          ...NavDefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.onSurface,
          border: theme.colors.outline,
          primary: theme.colors.primary,
        },
      };

  return (
    <PaperProvider
      theme={theme}
      settings={{
        icon: (props) => <MaterialCommunityIcons {...props} />,
      }}
    >
      <GlobalUiProvider>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <NavigationContainer theme={navTheme}>
          <RootNavigator />
        </NavigationContainer>
        {showLaunchIntro && (
          <LaunchSplash onFinish={() => setShowLaunchIntro(false)} />
        )}
      </GlobalUiProvider>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MainApp />
        </ThemeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

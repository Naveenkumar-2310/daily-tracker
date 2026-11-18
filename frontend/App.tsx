import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppTheme } from './src/theme/theme';
import { GlobalUiProvider } from './src/context/GlobalUiContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { queryClient } from './src/api/queryClient';

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <PaperProvider
          theme={AppTheme}
          settings={{
            icon: (props) => <MaterialCommunityIcons {...props} />,
          }}
        >
          <GlobalUiProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </GlobalUiProvider>
        </PaperProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

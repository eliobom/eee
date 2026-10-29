import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import ErrorBoundary from './src/components/ErrorBoundary';

// Enable scroll on web
if (Platform.OS === 'web') {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    const root = document.getElementById('root');
    if (root) {
      root.style.overflow = 'auto';
      root.style.height = 'auto';
    }
  }
}

export default function App() {
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      const root = document.getElementById('root');
      if (root) {
        root.style.overflow = 'auto';
        root.style.height = 'auto';
      }
    }
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </AuthProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

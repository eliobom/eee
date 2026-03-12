import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    global.token = null;
    global.user = null;
  };

  // Check if user is already logged in (from global state)
  useEffect(() => {
    if (global.user && global.token) {
      setUser(global.user);
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppNavigator user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

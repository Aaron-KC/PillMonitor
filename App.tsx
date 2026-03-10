import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* <LoginScreen navigation={{ replace: () => {} }} /> */}
      {/* <DashboardScreen navigation={{ replace: () => {} }} /> */}
      {/* <AddPillScreen navigation={{ replace: () => {} }} /> */}
      <AppNavigator />
    </SafeAreaProvider>
  );
}
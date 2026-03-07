import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import DashboardScreen from './src/screens/DashboardScreen';
import AddPillScreen from './src/screens/AddPillScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      {/* <LoginScreen navigation={{ replace: () => {} }} /> */}
      {/* <DashboardScreen navigation={{ replace: () => {} }} /> */}
      <AddPillScreen navigation={{ replace: () => {} }} />
    </SafeAreaProvider>
  );
}
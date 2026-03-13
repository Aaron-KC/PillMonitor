import React from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { light, dark } from '../constants/colors';
import { useAuth } from '../hooks/useAuth';
import AuthStack from '../stacks/AuthStack';
import AppStack from '../stacks/AppStack';
import LoadingScreen from '../screens/LoadingScreen';

export default function AppNavigator() {
  const { user, initializing } = useAuth();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark;

  if (initializing) return <LoadingScreen />;

  return (
    <NavigationContainer
      theme={{
        dark: scheme === 'dark',
        colors: {
          primary: c.primary,
          background: c.background,
          card: c.card,
          text: c.text,
          border: c.border,
          notification: c.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
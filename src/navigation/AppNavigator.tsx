import React from 'react';
import { ActivityIndicator, useColorScheme, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddPillScreen from '../screens/AddPillScreen';

import { light, dark } from '../constants/colors';
import { RootStackParamList, TabParamList } from '../types.ts';
import { useAuth } from '../hooks/useAuth.ts';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark; // Intentionally inverted for better aesthetics
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: c.card,
          borderTopColor: c.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, initializing } = useAuth();
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark;

  console.log(user, initializing)

  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: c.background,
        }}
      >
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={user ? 'MainTabs' : 'Login'}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: c.background },
        }}
      >
        {
          user ? <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen
            name="AddPill"
            component={AddPillScreen}
            options={{ presentation: 'modal' }}
          />
          </>
          :
          <Stack.Screen name="Login" component={LoginScreen} />
        }
      </Stack.Navigator>
    </NavigationContainer>
  );
}

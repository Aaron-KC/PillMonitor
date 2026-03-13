import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainTabs from '../tabs/MainTabs'
import AddPillScreen from '../screens/AddPillScreen';
import { AppStackParamList } from '../types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export default function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen
        name="AddPill"
        component={AddPillScreen}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
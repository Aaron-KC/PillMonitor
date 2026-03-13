import React from 'react';
import { ActivityIndicator, useColorScheme, View, StyleSheet } from 'react-native';
import { light, dark } from '../constants/colors';

export default function LoadingScreen() {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <ActivityIndicator size="large" color={c.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
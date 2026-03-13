import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  c: any;
};

export function StatCard({ icon, label, value, valueColor, c }: Props) {
  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      {icon}
      <Text style={[styles.label, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor ?? c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 16,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
  },
});
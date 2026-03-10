import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCcw } from 'lucide-react-native';

interface StatusOverlayProps {
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  c: any;
}

export const StatusOverlay = ({ loading, error, onRetry, c }: StatusOverlayProps) => {
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: c.background }]}>
        <ActivityIndicator size="large" color={c.primary} />
        <Text style={[styles.text, { color: c.muted, marginTop: 12 }]}>
          Syncing your medications...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: c.background, paddingHorizontal: 40 }]}>
        <AlertCircle size={48} color={c.danger} strokeWidth={1.5} />
        <Text style={[styles.title, { color: c.text }]}>Connection Issue</Text>
        <Text style={[styles.text, { color: c.muted }]}>{error}</Text>
        
        <TouchableOpacity 
          style={[styles.retryBtn, { backgroundColor: c.primary }]} 
          onPress={onRetry}
          activeOpacity={0.8}
        >
          <RefreshCcw size={18} color="#fff" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  retryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Bell, 
  ShieldCheck, 
  LogOut, 
  CircleUser
} from 'lucide-react-native';
import { light, dark } from '../constants/colors';
import { StatCard } from '../components/StatCard';
import { useDeviceStatus } from '../hooks/useDeviceStatus';
import { logOut } from '../services/auth';
import MenuItem from '../components/MenuItem';

type Props = {
  navigation: any;
};

export default function ProfileScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark;
  const deviceStatus = useDeviceStatus();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          style: "destructive", 
          onPress: () => {
            logOut()
          } 
        }
      ]
    );
  };
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: c.primary + '15', borderColor: c.primary + '30' }]}>
            <CircleUser size={60} color={c.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.userName, { color: c.text }]}>{deviceStatus.patientName}</Text>
        </View>
        <View style={styles.statsRow}>
          <StatCard
            c={c}
            icon={<ShieldCheck size={18} color={c.success} />}
            label="Account"
            value="Verified"
            valueColor={c.success}
          />
          <StatCard
            c={c}
            icon={<Bell size={18} color={c.primary} />}
            label="Reminders"
            value="Active"
          />
        </View>
        <Text style={[styles.sectionLabel, { color: c.muted, marginTop: 24 }]}>Session</Text>
        <View style={[styles.menuGroup, { backgroundColor: c.card, borderColor: c.border }]}>
          <MenuItem 
            icon={<LogOut size={18} color={c.danger} />} 
            label="Logout" 
            onPress={handleLogout} 
            showBorder={false}
            textColor={c.danger}
            c={c}
          />
        </View>
        <Text style={[styles.versionText, { color: c.muted }]}>Version 1.0.4 (Build 22)</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 30,
    paddingBottom: 40,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuGroup: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 32,
    opacity: 0.6,
  },
});
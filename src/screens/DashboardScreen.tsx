import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Clock, Lock, LockOpen, BatteryMedium, Plus } from 'lucide-react-native';
import { light, dark } from '../constants/colors';
import { StatusOverlay } from '../components/StatusOverlay';
import { StatCard } from '../components/StatCard';
import { MedCard } from '../components/MedCard';
import { useMedications } from '../hooks/useMedications'
import { useDeviceStatus } from '../hooks/useDeviceStatus';

type Props = {
  navigation: any;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark;

  const [refreshing, setRefreshing] = useState(false);
  const { medicines, loading, error, reload } = useMedications();
  const deviceStatus = useDeviceStatus();

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['top']}>
      <StatusOverlay loading={loading} error={error} onRetry={reload} c={c} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={c.primary} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: c.muted }]}>
              {`${getGreeting()}, ${deviceStatus.patientName}`}
            </Text>
            <Text style={[styles.title, { color: c.text }]}>Dashboard</Text>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: c.success + '18' }]}>
            <Text style={[styles.liveText, { color: c.success }]}>Live</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            c={c}
            icon={<Clock size={18} color={c.primary} strokeWidth={2} />}
            label="Last Sync"
            value={deviceStatus.lastSync}
          />
          <StatCard
            c={c}
            icon={
              deviceStatus.isDoorOpen
                ? <LockOpen size={18} color={c.danger} strokeWidth={2} />
                : <Lock size={18} color={c.success} strokeWidth={2} />
            }
            label="Dispenser"
            value={deviceStatus.isDoorOpen ? 'Open' : 'Secure'}
            valueColor={deviceStatus.isDoorOpen ? c.danger : c.success}
          />
          <StatCard
            c={c}
            icon={<BatteryMedium size={18} color={c.primary} strokeWidth={2} />}
            label="Battery"
            value={`${deviceStatus.battery}%`}
            valueColor={deviceStatus.battery < 20 ? c.danger : undefined}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: c.muted }]}>Active Medications</Text>

        {medicines.length > 0
          ? medicines.map(med => <MedCard key={med.id} med={med} c={c} onEdit={() => navigation.navigate("EditPill", {medication: med})}/>)
          : !loading && (
              <Text style={[styles.emptyText, { color: c.muted }]}>
                No medications added yet.
              </Text>
            )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: c.primary }]}
        onPress={() => navigation.navigate('AddPill')}
        activeOpacity={0.85}
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 110,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  liveBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 4,
  },
  liveText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
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
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 40,
  },
  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});
import React, { useEffect, useState } from 'react';
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
import {
  Clock,
  Lock,
  LockOpen,
  BatteryMedium,
  Plus,
  AlertTriangle,
  Activity,
  CalendarClock,
} from 'lucide-react-native';
import { light, dark } from '../constants/colors';
import { subscribeToMedications } from '../services/firestore';
import { StatusOverlay } from '../components/StatusOverlay';
import { getAuth } from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { formatTimestamp } from '../utils/time';


type Medicine = {
  id: string;
  name: string;
  stock: { total: number; remaining: number };
  schedule: { hour: number; minute: number; formatted: string }[];
  startDate: any;
};


type Props = {
  navigation: any;
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({
  icon,
  label,
  value,
  valueColor,
  c,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
  c: typeof light;
}) {
  return (
    <View
      style={[
        statStyles.card,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      {icon}
      <Text style={[statStyles.label, { color: c.muted }]}>{label}</Text>
      <Text style={[statStyles.value, { color: valueColor ?? c.text }]}>
        {value}
      </Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
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

const getEffectiveStatus = (startDate: any) => {
  const start = startDate?.seconds
    ? new Date(startDate.seconds * 1000)
    : new Date(startDate);

  const now = new Date();

  const startMidnight = new Date(start.setHours(0, 0, 0, 0));
  const nowMidnight = new Date(now.setHours(0, 0, 0, 0));

  if (startMidnight > nowMidnight) {
    const formatted = start.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
    return { label: `Starts ${formatted}`, active: false };
  }

  return { label: 'Active Course', active: true };
};

function MedCard({ med, c }: { med: Medicine; c: typeof light }) {
  const status = getEffectiveStatus(med.startDate);
  const ratio = med.stock.remaining / med.stock.total;
  const isLow = ratio < 0.3;
  const barColor = isLow ? c.danger : c.primary;
  const pct = Math.round(ratio * 100);

  return (
    <View
      style={[
        medStyles.card,
        { backgroundColor: c.card, borderColor: c.border },
      ]}
    >
      <View style={medStyles.statusHeader}>
        {status.active ? (
          <Activity size={12} color={c.success} strokeWidth={2.5} />
        ) : (
          <CalendarClock size={12} color="#D97706" strokeWidth={2.5} />
        )}

        <Text
          style={[
            medStyles.statusText,
            { color: status.active ? c.success : '#D97706' },
          ]}
        >
          {status.label}
        </Text>
      </View>
      <View style={medStyles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={medStyles.nameRow}>
            <Text style={[medStyles.name, { color: c.text }]}>{med.name}</Text>
          </View>

          <View style={medStyles.chipsRow}>
            {med.schedule.map(t => (
              <View
                key={t.formatted}
                style={[
                  medStyles.chip,
                  { backgroundColor: c.inputBg, borderColor: c.border },
                ]}
              >
                <Clock size={11} color={c.muted} strokeWidth={2} />
                <Text style={[medStyles.chipText, { color: c.subtext }]}>
                  {t.formatted}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={medStyles.stockCol}>
          <View style={[medStyles.stockTrack, { backgroundColor: c.inputBg }]}>
            <View
              style={[
                medStyles.stockFill,
                { height: `${pct}%` as any, backgroundColor: barColor },
              ]}
            />
          </View>
          <Text style={[medStyles.stockPct, { color: barColor }]}>{pct}%</Text>
        </View>
      </View>

      <View style={[medStyles.divider, { backgroundColor: c.divider }]} />

      <View style={medStyles.bottomRow}>
        <Text style={[medStyles.stockInfo, { color: c.muted }]}>
          {med.stock.remaining} of {med.stock.total} pills remaining
        </Text>
        {isLow && (
          <View
            style={[medStyles.lowBadge, { backgroundColor: c.danger + '18' }]}
          >
            <AlertTriangle size={11} color={c.danger} strokeWidth={2.5} />
            <Text style={[medStyles.lowText, { color: c.danger }]}>Low</Text>
          </View>
        )}
      </View>

      <View style={[medStyles.progressTrack, { backgroundColor: c.inputBg }]}>
        <View
          style={[
            medStyles.progressFill,
            { width: `${pct}%` as any, backgroundColor: barColor },
          ]}
        />
      </View>
    </View>
  );
}

const medStyles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    gap: 12,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  dosageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  dosageText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stockCol: {
    alignItems: 'center',
    marginLeft: 16,
    gap: 5,
  },
  stockTrack: {
    width: 32,
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  stockFill: {
    width: '100%',
    borderRadius: 8,
  },
  stockPct: {
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: 1,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stockInfo: {
    fontSize: 12,
    fontWeight: '500',
  },
  lowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 7,
  },
  lowText: {
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default function DashboardScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark; // Intentionally inverted for better aesthetics

  const [refreshing, setRefreshing] = useState(false);
  const [medicines, setMedicines] = useState<Medicine[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deviceStatus, setDeviceStatus] = useState({
  lastSync: '---',
  isDoorOpen: false,
  battery: 0,
  patientName: 'User',
});

useEffect(() => {
  const user = getAuth().currentUser;
  if (!user) return;

  const unsubscribe = firestore()
    .collection('devices')
    .doc(user.uid) 
    .onSnapshot(querySnapshot => {
         const data = querySnapshot.data();
         if (!data) return;

         setDeviceStatus({
           lastSync: data.lastSync ? formatTimestamp(data.lastSync) : '---',
           isDoorOpen: data.isDoorOpen || false,
           battery: data.battery || 0,
           patientName: data.patientName || 'User',
         });
       }, error => {
         console.error('Error fetching device status:', error);
       });
  
  return () => unsubscribe();
}, []);

  const loadData = () => {
    setError(null);
    setLoading(true);

    return subscribeToMedications(
      meds => {
        setMedicines(meds);
        setLoading(false);
      },
      err => {
        setLoading(false);
        setError(
          "We couldn't load your medications. Check your internet connection or Firestore rules.",
        );
      },
    );
  };

  useEffect(() => {
    const unsubscribe = loadData();
    return () => unsubscribe();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: c.background }]}
      edges={['top']}
    >
      <StatusOverlay
        loading={loading}
        error={error}
        onRetry={loadData}
        c={c}
      />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={c.primary}
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: c.muted }]}>
              {`${getGreeting()}, ${deviceStatus.patientName}`}
            </Text>
            <Text style={[styles.title, { color: c.text }]}>Dashboard</Text>
          </View>
          <View
            style={[styles.liveBadge, { backgroundColor: c.success + '18' }]}
          >
            <Text style={[styles.liveText, { color: c.success }]}>Live</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatCard
            c={c}
            icon={<Clock size={18} color={c.primary} strokeWidth={2} />}
            label="Last Sync"
            value={deviceStatus?.lastSync ? deviceStatus.lastSync : '---'}
          />
          <StatCard
            c={c}
            icon={
              deviceStatus.isDoorOpen ? (
                <LockOpen size={18} color={c.danger} strokeWidth={2} />
              ) : (
                <Lock size={18} color={c.success} strokeWidth={2} />
              )
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

        <Text style={[styles.sectionLabel, { color: c.muted }]}>
          Active Medications
        </Text>

        {medicines &&
          medicines?.length > 0 &&
          medicines.map(med => <MedCard key={med.id} med={med} c={c} />)}
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
  safe: {
    flex: 1,
  },
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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

  fab: {
    position: 'absolute',
    bottom: 36,
    right: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
});

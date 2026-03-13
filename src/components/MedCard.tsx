import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Clock, AlertTriangle, Activity, CalendarClock, Pencil, Trash2 } from 'lucide-react-native';
import { Medicine } from '../types';
import { deleteMedication } from '../services/firestore';
import { cancelMedicationNotifications } from '../services/notificationService';

type Props = {
  med: Medicine;
  c: any;
  onEdit: (med: Medicine) => void;
};

function getEffectiveStatus(startDate: any) {
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
}

export function MedCard({ med, c, onEdit }: Props) {
  const status = getEffectiveStatus(med.startDate);
  const ratio = med.stock.remaining / med.stock.total;
  const isLow = ratio < 0.3;
  const barColor = isLow ? c.danger : c.primary;
  const pct = Math.round(ratio * 100);
  
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = () => {
    Alert.alert(
      'Delete Medication',
      `Remove "${med.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              await cancelMedicationNotifications(med.id, med.schedule);
              await deleteMedication(med.id);
            } catch (error) {
              Alert.alert("Error", "Could not delete medication");
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
      
      <View style={styles.headerRow}>
        <View style={styles.statusHeader}>
          {status.active
            ? <Activity size={12} color={c.success} strokeWidth={2.5} />
            : <CalendarClock size={12} color="#D97706" strokeWidth={2.5} />}
          <Text style={[styles.statusText, { color: status.active ? c.success : '#D97706' }]}>
            {status.label}
          </Text>
        </View>

        <View style={styles.inlineActions}>
          <TouchableOpacity 
            onPress={() => onEdit(med)} 
            style={[styles.miniActionBtn, { backgroundColor: c.primary + '15' }]}
          >
            <Pencil size={14} color={c.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={handleDelete} 
            disabled={deleting}
            style={[styles.miniActionBtn, { backgroundColor: c.danger + '15' }]}
          >
            {deleting 
              ? <ActivityIndicator size="small" color={c.danger} /> 
              : <Trash2 size={14} color={c.danger} />}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: c.text }]}>{med.name}</Text>
          <View style={styles.chipsRow}>
            {med.schedule.map(t => (
              <View
                key={t.formatted}
                style={[styles.chip, { backgroundColor: c.inputBg, borderColor: c.border }]}
              >
                <Clock size={11} color={c.muted} strokeWidth={2} />
                <Text style={[styles.chipText, { color: c.subtext }]}>{t.formatted}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.stockCol}>
          <View style={[styles.stockTrack, { backgroundColor: c.inputBg }]}>
            <View
              style={[styles.stockFill, { height: `${pct}%` as any, backgroundColor: barColor }]}
            />
          </View>
          <Text style={[styles.stockPct, { color: barColor }]}>{pct}%</Text>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: c.divider }]} />

      <View style={styles.bottomRow}>
        <Text style={[styles.stockInfo, { color: c.muted }]}>
          {med.stock.remaining} of {med.stock.total} pills remaining
        </Text>
        {isLow && (
          <View style={[styles.lowBadge, { backgroundColor: c.danger + '18' }]}>
            <AlertTriangle size={11} color={c.danger} strokeWidth={2.5} />
            <Text style={[styles.lowText, { color: c.danger }]}>Low</Text>
          </View>
        )}
      </View>

      <View style={[styles.progressTrack, { backgroundColor: c.inputBg }]}>
        <View
          style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: barColor }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 8,
  },
  miniActionBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
  name: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 10,
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
  divider: { height: 1 },
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
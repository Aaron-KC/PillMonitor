import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  useColorScheme,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import {
  ChevronLeft,
  Calendar,
  Clock,
  Plus,
  Pencil,
  X,
  CheckCircle2,
  Check,
} from 'lucide-react-native';
import { light, dark } from '../constants/colors';
import {
  addMedicationToFirestore,
  MedicationData,
} from '../services/firestore';
import { scheduleMedicationNotifications } from '../services/notificationService';

type Props = {
  navigation: any;
};

function formatTime(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AddPillScreen({ navigation }: Props) {
  const scheme = useColorScheme();
  const c = scheme === 'dark' ? light : dark;

  const [name, setName] = useState('');
  const [totalStock, setTotalStock] = useState('');
  const [schedule, setSchedule] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isFromToday, setIsFromToday] = useState(true);

  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState<'add' | 'edit'>('add');
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [tempTime, setTempTime] = useState(new Date());
  const [tempDate, setTempDate] = useState(new Date());

  const [nameFocused, setNameFocused] = useState(false);
  const [stockFocused, setStockFocused] = useState(false);

  const [isSaving, setIsSaving] = useState(false);

  const openAddTime = () => {
    setTempTime(new Date());
    setPickerMode('add');
    setTimePickerVisible(true);
  };

  const openEditTime = (index: number) => {
    setSelectedIndex(index);
    setTempTime(schedule[index]);
    setPickerMode('edit');
    setTimePickerVisible(true);
  };

  const finalizeTime = (dateToUse?: Date) => {
    const t = dateToUse ?? tempTime;
    if (pickerMode === 'add') {
      setSchedule(prev => [...prev, t]);
    } else if (pickerMode === 'edit' && selectedIndex !== null) {
      const updated = [...schedule];
      updated[selectedIndex] = t;
      setSchedule(updated);
    }
    setTimePickerVisible(false);
  };

  const handleTimeChange = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === 'android') {
      setTimePickerVisible(false);
      if (e.type === 'dismissed' || !d) return;
      finalizeTime(d);
    } else {
      if (!d) return;
      setTempTime(d);
    }
  };

  const handleDateChange = (e: DateTimePickerEvent, d?: Date) => {
    if (Platform.OS === 'android') {
      setDatePickerVisible(false);
      if (e.type === 'dismissed' || !d) return;
      setStartDate(d);
    } else {
      if (!d) return;
      setTempDate(d);
    }
  };

  const removeTime = (index: number) => {
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };

  const isFormValid =
    name.trim().length > 0 &&
    totalStock.trim().length > 0 &&
    schedule.length > 0 &&
    (isFromToday || startDate !== null);

  const handleSave = async () => {
    if (!isFormValid) return;

    setIsSaving(true);

    try {
      const finalStartDate = isFromToday ? new Date() : startDate || new Date();

      const scheduleSlots = schedule.map(d => ({
        hour: d.getHours(),
        minute: d.getMinutes(),
        formatted: formatTime(d),
      }));

      const pillData: MedicationData = {
        name: name.trim(),
        totalStock: parseInt(totalStock, 10),
        startDate: finalStartDate,
        isFromToday,
        schedule: scheduleSlots,
      };

      addMedicationToFirestore(pillData)
        .then(ref => {
          if (ref) {
            scheduleMedicationNotifications(
              ref.id,
              name.trim(),
              scheduleSlots,
            );
          }
          console.log(ref)
          setIsSaving(false);
          navigation.navigate('MainTabs');
        })
        .catch(err => console.error('Save/notification error:', err));

    } catch (error: any) {
      console.error(error);
      setIsSaving(false);
      Alert.alert(
        'Save Failed',
        'Could not save medication. Please check your connection.',
      );
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]}>
      <View style={[styles.navBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={22} color={c.primary} strokeWidth={2.5} />
          <Text style={[styles.backText, { color: c.primary }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: c.text }]}>Add Medication</Text>
        <View style={{ width: 64 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sectionLabel, { color: c.muted }]}>
              Medication Details
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text style={[styles.fieldLabel, { color: c.subtext }]}>
                Medicine Name
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    color: c.text,
                    borderBottomColor: nameFocused ? c.primary : c.border,
                  },
                ]}
                placeholder="e.g. Amlodipine"
                placeholderTextColor={c.muted}
                value={name}
                onChangeText={setName}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
                returnKeyType="next"
              />

              <Text
                style={[styles.fieldLabel, { color: c.subtext, marginTop: 14 }]}
              >
                Total Pills to Load
              </Text>
              <TextInput
                style={[
                  styles.fieldInput,
                  {
                    color: c.text,
                    borderBottomColor: stockFocused ? c.primary : c.border,
                  },
                ]}
                placeholder="e.g. 30"
                placeholderTextColor={c.muted}
                keyboardType="number-pad"
                value={totalStock}
                onChangeText={setTotalStock}
                onFocus={() => setStockFocused(true)}
                onBlur={() => setStockFocused(false)}
              />
            </View>

            <Text style={[styles.sectionLabel, { color: c.muted }]}>
              Start Date
            </Text>
            <View
              style={[
                styles.card,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <TouchableOpacity
                style={styles.dateRow}
                onPress={() => {
                  if (!isFromToday) {
                    setTempDate(startDate ?? new Date());
                    setDatePickerVisible(true);
                  }
                }}
                activeOpacity={isFromToday ? 1 : 0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: c.subtext }]}>
                    Begin course on
                  </Text>
                  <Text
                    style={[
                      styles.dateValue,
                      { color: isFromToday ? c.muted : c.text },
                    ]}
                  >
                    {isFromToday
                      ? `Today — ${formatDate(new Date())}`
                      : startDate
                      ? formatDate(startDate)
                      : 'Tap to choose a date'}
                  </Text>
                </View>
                {!isFromToday && (
                  <Calendar size={18} color={c.primary} strokeWidth={2} />
                )}
              </TouchableOpacity>

              <View style={[styles.divider, { backgroundColor: c.divider }]} />

              <TouchableOpacity
                style={styles.checkRow}
                onPress={() => {
                  if (!isFromToday) setStartDate(null);
                  setIsFromToday(v => !v);
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isFromToday ? c.primary : c.border,
                      backgroundColor: isFromToday ? c.primary : 'transparent',
                    },
                  ]}
                >
                  {isFromToday && (
                    <Check size={12} color="#fff" strokeWidth={3} />
                  )}
                </View>
                <Text style={[styles.checkLabel, { color: c.text }]}>
                  Start from today
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.scheduleHeader}>
              <Text style={[styles.sectionLabel, { color: c.muted }]}>
                Dosage Times
              </Text>
              <TouchableOpacity
                style={[styles.addTimeBtn, { backgroundColor: c.primary }]}
                onPress={openAddTime}
                activeOpacity={0.8}
              >
                <Plus size={14} color="#fff" strokeWidth={2.5} />
                <Text style={styles.addTimeBtnText}>Add Time</Text>
              </TouchableOpacity>
            </View>

            {schedule.length === 0 ? (
              <View style={[styles.emptyState, { borderColor: c.border }]}>
                <Clock size={28} color={c.border} strokeWidth={1.5} />
                <Text style={[styles.emptyTitle, { color: c.muted }]}>
                  No dose times yet
                </Text>
                <Text style={[styles.emptyHint, { color: c.muted }]}>
                  Tap "Add Time" to schedule doses
                </Text>
              </View>
            ) : (
              schedule.map((time, index) => (
                <View
                  key={index}
                  style={[
                    styles.timeCard,
                    { backgroundColor: c.card, borderColor: c.border },
                  ]}
                >
                  <View
                    style={[
                      styles.timeIconWrap,
                      { backgroundColor: c.primary + '18' },
                    ]}
                  >
                    <Clock size={16} color={c.primary} strokeWidth={2} />
                  </View>
                  <TouchableOpacity
                    style={styles.timeInfo}
                    onPress={() => openEditTime(index)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.timeValue, { color: c.text }]}>
                      {formatTime(time)}
                    </Text>
                    <View
                      style={[styles.editChip, { backgroundColor: c.inputBg }]}
                    >
                      <Pencil size={10} color={c.muted} strokeWidth={2} />
                      <Text style={[styles.editChipText, { color: c.muted }]}>
                        Edit
                      </Text>
                    </View>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => removeTime(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <X size={18} color={c.danger} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
              ))
            )}

            <View style={{ height: 120 }} />
          </ScrollView>
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.footer,
            { backgroundColor: c.background, borderTopColor: c.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.saveBtn,
              { backgroundColor: isFormValid ? c.primary : c.inputBg },
            ]}
            onPress={handleSave}
            activeOpacity={isFormValid ? 0.8 : 1}
            disabled={!isFormValid || isSaving}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <CheckCircle2
                  size={18}
                  color={isFormValid ? '#fff' : c.muted}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.saveBtnText,
                    { color: isFormValid ? '#fff' : c.muted },
                  ]}
                >
                  Confirm & Add Medication
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {Platform.OS === 'android' ? (
        // Android: render naked picker (no modal), it shows as a native dialog
        timePickerVisible && (
          <DateTimePicker
            value={tempTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )
      ) : (
        // iOS: keep the bottom-sheet modal
        <Modal
          visible={timePickerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setTimePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.sheet, { backgroundColor: c.card }]}>
              <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
              <Text style={[styles.sheetTitle, { color: c.text }]}>
                {pickerMode === 'add' ? 'Add Dose Time' : 'Edit Dose Time'}
              </Text>
              <DateTimePicker
                value={tempTime}
                mode="time"
                is24Hour={false}
                display="spinner"
                onChange={handleTimeChange}
                textColor={c.text}
                style={{ alignSelf: 'center' }}
              />
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: c.border }]}
                  onPress={() => setTimePickerVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelText, { color: c.danger }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: c.primary }]}
                  onPress={() => finalizeTime()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {Platform.OS === 'android' ? (
        datePickerVisible && (
          <DateTimePicker
            value={tempDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )
      ) : (
        <Modal
          visible={datePickerVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setDatePickerVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.sheet, { backgroundColor: c.card }]}>
              <View style={[styles.sheetHandle, { backgroundColor: c.border }]} />
              <Text style={[styles.sheetTitle, { color: c.text }]}>
                Select Start Date
              </Text>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                minimumDate={new Date()}
                onChange={handleDateChange}
                textColor={c.text}
                style={{ alignSelf: 'center' }}
              />
              <View style={styles.sheetActions}>
                <TouchableOpacity
                  style={[styles.cancelBtn, { borderColor: c.border }]}
                  onPress={() => setDatePickerVisible(false)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.cancelText, { color: c.danger }]}>
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, { backgroundColor: c.primary }]}
                  onPress={() => {
                    setStartDate(tempDate);
                    setDatePickerVisible(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    width: 64,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },

  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 24,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  fieldInput: {
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 6,
    borderBottomWidth: 1.5,
    marginBottom: 4,
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkLabel: {
    fontSize: 15,
    fontWeight: '500',
  },

  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addTimeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
  },
  addTimeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },

  emptyState: {
    padding: 36,
    alignItems: 'center',
    gap: 8,
    borderStyle: 'solid',
    borderWidth: 1.5,
    borderRadius: 18,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  emptyHint: {
    fontSize: 13,
    textAlign: 'center',
    opacity: 0.7,
  },

  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  timeIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timeValue: {
    fontSize: 17,
    fontWeight: '700',
  },
  editChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  editChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    height: 56,
    borderRadius: 14,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '700',
  },
  confirmBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
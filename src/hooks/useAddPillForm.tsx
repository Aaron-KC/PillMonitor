import { useState } from 'react';
import { Alert } from 'react-native';
import { addMedicationToFirestore, updateMedication } from '../services/firestore';
import { cancelMedicationNotifications, scheduleMedicationNotifications } from '../services/notificationService';
import { Medicine, MedicationSchedule } from '../types';

function formatTime(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}

function scheduleToDate(slot: MedicationSchedule): Date {
  const d = new Date();
  d.setHours(slot.hour, slot.minute, 0, 0);
  return d;
}

function firestoreTimestampToDate(value: any): Date {
  if (value?.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
}

interface UseAddPillFormOptions {
  existing?: Medicine;
  onSuccess: () => any;
}

export function useAddPillForm({ existing, onSuccess }: UseAddPillFormOptions = {} as any) {
  const isEditMode = !!existing;

  const [name, setName] = useState(existing?.name ?? '');
  const [totalStock, setTotalStock] = useState(
    existing ? String(existing.stock.total) : '',
  );
  const [schedule, setSchedule] = useState<Date[]>(
    existing ? existing.schedule.map(scheduleToDate) : [],
  );
  const [startDate, setStartDate] = useState<Date | null>(
    existing ? firestoreTimestampToDate(existing.startDate) : null,
  );
  const [isFromToday, setIsFromToday] = useState(isEditMode ? false : true);
  const [isSaving, setIsSaving] = useState(false);

  const isFormValid =
    name.trim().length > 0 &&
    totalStock.trim().length > 0 &&
    schedule.length > 0 &&
    (isFromToday || startDate !== null);

  const addScheduleTime = (date: Date) => setSchedule(prev => [...prev, date]);

  const editScheduleTime = (index: number, date: Date) =>
    setSchedule(prev => {
      const updated = [...prev];
      updated[index] = date;
      return updated;
    });

  const removeScheduleTime = (index: number) =>
    setSchedule(prev => prev.filter((_, i) => i !== index));

  const toggleStartFromToday = () => {
    if (!isFromToday) setStartDate(null);
    setIsFromToday(v => !v);
  };

  const handleSave = () => {
    if (!isFormValid) return;
    setIsSaving(true);

    const finalStartDate = isFromToday ? new Date() : startDate || new Date();
    const scheduleSlots: MedicationSchedule[] = schedule.map(d => ({
      hour: d.getHours(),
      minute: d.getMinutes(),
      formatted: formatTime(d),
    }));

    if (isEditMode && existing) {
      updateMedication(existing.id, {
        name: name.trim(),
        totalStock: parseInt(totalStock, 10),
        startDate: finalStartDate,
        isFromToday,
        schedule: scheduleSlots,
      })
        .then(async success => {
          if (success) {
            await cancelMedicationNotifications(existing.id, existing.schedule);
            await scheduleMedicationNotifications(existing.id, name.trim(), scheduleSlots);
            setIsSaving(false);
            onSuccess();
          } else {
            throw new Error('Update returned false');
          }
        })
        .catch(err => {
          console.error('Update error:', err);
          setIsSaving(false);
          Alert.alert('Update Failed', 'Could not update medication. Please try again.');
        });
    } else {
      addMedicationToFirestore({
        name: name.trim(),
        totalStock: parseInt(totalStock, 10),
        startDate: finalStartDate,
        isFromToday,
        schedule: scheduleSlots,
      })
        .then(ref => {
          if (ref) {
            scheduleMedicationNotifications(ref.id, name.trim(), scheduleSlots);
          }
          setIsSaving(false);
          onSuccess();
        })
        .catch(err => {
          console.error('Save error:', err);
          setIsSaving(false);
          Alert.alert('Save Failed', 'Could not save medication. Please check your connection.');
        });
    }
  };

  return {
    isEditMode,
    name, setName,
    totalStock, setTotalStock,
    schedule,
    startDate, setStartDate,
    isFromToday,
    isSaving,
    isFormValid,
    addScheduleTime,
    editScheduleTime,
    removeScheduleTime,
    toggleStartFromToday,
    handleSave,
  };
}
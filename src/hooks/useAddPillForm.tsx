import { useState } from 'react';
import { Alert } from 'react-native';
import { addMedicationToFirestore } from '../services/firestore';
import { scheduleMedicationNotifications } from '../services/notificationService';
import { MedicationSchedule } from '../types';

function formatTime(date: Date): string {
  let h = date.getHours();
  const m = date.getMinutes();
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m < 10 ? '0' + m : m} ${ampm}`;
}

export function useAddPillForm(onSuccess: () => void) {
  const [name, setName] = useState('');
  const [totalStock, setTotalStock] = useState('');
  const [schedule, setSchedule] = useState<Date[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [isFromToday, setIsFromToday] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const isFormValid =
    name.trim().length > 0 &&
    totalStock.trim().length > 0 &&
    schedule.length > 0 &&
    (isFromToday || startDate !== null);

  const addScheduleTime = (date: Date) => {
    setSchedule(prev => [...prev, date]);
  };

  const editScheduleTime = (index: number, date: Date) => {
    setSchedule(prev => {
      const updated = [...prev];
      updated[index] = date;
      return updated;
    });
  };

  const removeScheduleTime = (index: number) => {
    setSchedule(prev => prev.filter((_, i) => i !== index));
  };

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
  };

  return {
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
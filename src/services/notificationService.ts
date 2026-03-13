import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
  AuthorizationStatus,
} from '@notifee/react-native';
import { Platform } from 'react-native';
import { MedicationSchedule } from './firestore';

const CHANNEL_ID = 'medication_reminders';

export async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Medication Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default',
      vibration: true,
    });
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

export async function scheduleMedicationNotifications(
  medicationId: string,
  medicationName: string,
  schedule: MedicationSchedule[],
) {
  await setupNotificationChannel();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  if (Platform.OS === 'android') {
    const settings = await notifee.getNotificationSettings();
    if (settings.android.alarm !== 1) {
      await notifee.openAlarmPermissionSettings();
    }
  }

  for (const slot of schedule) {
    const now = new Date();
    const fireDate = new Date();
    fireDate.setHours(slot.hour, slot.minute, 0, 0);

    if (fireDate.getTime() <= now.getTime()) {
      fireDate.setDate(fireDate.getDate() + 1);
    }

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: fireDate.getTime(),
      repeatFrequency: RepeatFrequency.DAILY,
      alarmManager: {
        allowWhileIdle: true,
      },
    };

    await notifee.createTriggerNotification(
      {
        id: `${medicationId}_${slot.hour}_${slot.minute}`,
        title: '💊 Medication Reminder',
        body: `Time to take your ${medicationName} (${slot.formatted})`,
        android: {
          channelId: CHANNEL_ID,
          importance: AndroidImportance.HIGH,
          pressAction: { id: 'default' },
          sound: 'default',
        },
        ios: {
          sound: 'default',
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      },
      trigger,
    );
  }
}

export async function cancelMedicationNotifications(
  medicationId: string,
  schedule: MedicationSchedule[],
) {
  const ids = schedule.map(
    slot => `${medicationId}_${slot.hour}_${slot.minute}`,
  );
  await notifee.cancelTriggerNotifications(ids);
}

export async function cancelAllMedicationNotifications() {
  await notifee.cancelAllNotifications();
}
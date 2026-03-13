import { useState, useEffect } from 'react';
import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { DeviceStatus } from '../types';
import { formatTimestamp } from '../utils/time';

const DEFAULT_STATUS: DeviceStatus = {
  lastSync: '---',
  isDoorOpen: false,
  battery: 0,
  patientName: 'User',
};

export function useDeviceStatus() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(DEFAULT_STATUS);

  useEffect(() => {
    const user = getAuth().currentUser;
    if (!user) return;

    const unsubscribe = firestore()
      .collection('devices')
      .doc(user.uid)
      .onSnapshot(
        snapshot => {
          const data = snapshot.data();
          if (!data) return;

          setDeviceStatus({
            lastSync: data.lastSync ? formatTimestamp(data.lastSync) : '---',
            isDoorOpen: data.isDoorOpen || false,
            battery: data.battery || 0,
            patientName: data.patientName || 'User',
          });
        },
        error => {
          console.error('Device status error:', error);
        },
      );

    return () => unsubscribe();
  }, []);

  return deviceStatus;
}
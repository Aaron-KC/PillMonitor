import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';

export interface MedicationSchedule {
  hour: number;
  minute: number;
  formatted: string;
}

export interface MedicationData {
  name: string;
  totalStock: number;
  startDate: Date;
  isFromToday: boolean;
  schedule: MedicationSchedule[];
}

export const addMedicationToFirestore = async (data: MedicationData) => {
  const user = getAuth().currentUser;

  if (!user) throw new Error('AUTH_REQUIRED');

  const medicationsRef = firestore()
    .collection('users')
    .doc(user.uid)
    .collection('medications');

  const res = await medicationsRef.add({
    name: data.name,
    stock: {
      total: data.totalStock,
      remaining: data.totalStock,
    },
    schedule: data.schedule,
    startDate: firestore.Timestamp.fromDate(data.startDate),
    createdAt: firestore.Timestamp.now(),
    isActive: true,
  });

  return res;
};

export const subscribeToMedications = (
  onUpdate: (data: any[]) => void,
  onError: (error: Error) => void
) => {
  const user = getAuth().currentUser;

  if (!user) {
    onError(new Error('AUTH_REQUIRED'));
    return () => {};
  }

  return firestore()
    .collection('users')
    .doc(user.uid)
    .collection('medications')
    .orderBy('createdAt', 'desc')
    .onSnapshot(
      querySnapshot => {
        if (!querySnapshot) return;
        const meds = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        onUpdate(meds);
      },
      error => {
        console.error('Firestore Streaming Error:', error);
        onError(error);
      }
    );
};
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

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
  const user = auth().currentUser;

  if (!user) throw new Error('AUTH_REQUIRED');

  try {
    const medicationsRef = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('medications');

    return await medicationsRef.add({
      name: data.name,
      totalStock: data.totalStock,
      remainingStock: data.totalStock,
      schedule: data.schedule,
      startDate: firestore.Timestamp.fromDate(data.startDate),
      createdAt: firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });
  } catch (error: any) {
    console.error('Firestore Error:', error);
    throw new Error(error.code || 'UNKNOWN_ERROR');
  }
};
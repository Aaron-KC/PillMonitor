import firestore from '@react-native-firebase/firestore';
import {getAuth} from '@react-native-firebase/auth';

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

  try {
    const medicationsRef = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('medications');

    return await medicationsRef.add({
      name: data.name,
      stock: {
         total: data.totalStock,
         remaining: data.totalStock,
      },
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
export const subscribeToMedications = (
  onUpdate: (data: any[]) => void,
  onError: (error: Error) => void 
) => {
  try {
    const user = getAuth().currentUser;
    
    if (!user) {
      throw new Error('AUTH_REQUIRED');
    }

    return firestore()
      .collection('users')
      .doc(user.uid)
      .collection('medications')
      .orderBy('createdAt', 'desc')
      .onSnapshot(
        (querySnapshot) => {
          if (!querySnapshot) return;

          const meds = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          onUpdate(meds);
        },
        (error) => {
          console.error("Firestore Streaming Error:", error);
          onError(error);
        }
      );
  } catch (error: any) {
    console.error("Subscription Setup Error:", error);
    onError(error);
    return () => {}; 
  }
};
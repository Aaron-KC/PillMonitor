import firestore from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import { MedicationData, Medicine } from '../types';

function getMedicationsRef() {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  return firestore()
    .collection('users')
    .doc(user.uid)
    .collection('medications');
}

export async function addMedicationToFirestore(data: MedicationData) {
  try {
    const ref = getMedicationsRef().doc();
    await ref.set({
      name: data.name,
      stock: {
        total: data.totalStock,
        remaining: data.totalStock,
      },
      schedule: data.schedule,
      startDate: firestore.Timestamp.fromDate(data.startDate),
      isFromToday: data.isFromToday,
      isActive: true,
      createdAt: firestore.Timestamp.now(),
    });
    return ref;
  } catch (error) {
    console.error('addMedicationToFirestore error:', error);
    return null;
  }
}

export function subscribeToMedications(
  onData: (meds: Medicine[]) => void,
  onError: (error: Error) => void,
) {
  const ref = getMedicationsRef().orderBy('createdAt', 'desc');

  return ref.onSnapshot(
    snapshot => {
      const meds = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Medicine[];
      onData(meds);
    },
    error => onError(error),
  );
}

export async function updateMedication(
  medicationId: string,
  data: Partial<MedicationData>,
): Promise<boolean> {
  try {
    const updatePayload: Record<string, any> = {};

    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.schedule !== undefined) updatePayload.schedule = data.schedule;
    if (data.startDate !== undefined) {
      updatePayload.startDate = firestore.Timestamp.fromDate(data.startDate);
    }
    if (data.isFromToday !== undefined) updatePayload.isFromToday = data.isFromToday;
    if (data.totalStock !== undefined) {
      updatePayload['stock.total'] = data.totalStock;
    }

    await getMedicationsRef().doc(medicationId).update(updatePayload);
    return true;
  } catch (error) {
    console.error('updateMedication error:', error);
    return false;
  }
}
export async function deleteMedication(medicationId: string): Promise<boolean> {
  try {
    await getMedicationsRef().doc(medicationId).delete();
    return true;
  } catch (error) {
    console.error('deleteMedication error:', error);
    return false;
  }
}
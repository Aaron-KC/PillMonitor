import { useState, useEffect } from 'react';
import { subscribeToMedications } from '../services/firestore';
import { Medicine } from '../types';

export function useMedications() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setError(null);
    setLoading(true);

    const unsubscribe = subscribeToMedications(
      meds => {
        setMedicines(meds);
        setLoading(false);
      },
      () => {
        setLoading(false);
        setError(
          "We couldn't load your medications. Check your internet connection or Firestore rules.",
        );
      },
    );

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = load();
    return () => unsubscribe();
  }, []);

  return { medicines, loading, error, reload: load };
}
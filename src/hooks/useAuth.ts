import { useState, useEffect } from 'react';
import { FirebaseAuthTypes, getAuth, onAuthStateChanged } from '@react-native-firebase/auth';

interface UseAuthReturn {
  user: FirebaseAuthTypes.User | null;
  initializing: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  function handleAuthStateChanged(user: FirebaseAuthTypes.User | null) {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuth(), handleAuthStateChanged);

    return unsubscribe;
  }, []);

  return { user, initializing };
};

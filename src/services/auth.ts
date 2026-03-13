import auth from '@react-native-firebase/auth';

export const login = async (email: string, password: string): Promise<void> => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
  } catch (error: any) {
    console.error(error)
    switch (error.code) {
      case 'auth/invalid-email':
        throw new Error('That email address is invalid.');
      case 'auth/invalid-credential':
        throw new Error('Incorrect email or password.');
      case 'auth/user-disabled':
        throw new Error('This account has been disabled.');
      case 'auth/user-not-found':
        throw new Error('No account found with this email.');
      case 'auth/wrong-password':
        throw new Error('Incorrect password.');
      case 'auth/too-many-requests':
        throw new Error('Too many failed attempts. Try again later.');
      default:
        throw new Error('An unknown error occurred. Please try again.');
    }
  }
};

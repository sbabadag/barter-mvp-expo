import { Platform } from 'react-native';

let firebaseApp: any = null;

export const initializeFirebase = async () => {
  console.log('🔥 Firebase initialization skipped - Firebase not available in this build');
  return null;
};

export const getFirebaseApp = () => null;

export const isFirebaseAvailable = () => false;

export const getFCMToken = async () => {
  console.log('🔥 FCM token generation skipped - Firebase not available in this build');
  return null;
};
import { Platform } from 'react-native';

let firebaseApp: any = null;

export const initializeFirebase = async () => {
  if (Platform.OS === 'android') {
    try {
      // Import Firebase only for Android development builds
      const { default: firebase } = require('@react-native-firebase/app');
      
      console.log('🔥 Initializing Firebase manually...');
      
      // Manual Firebase initialization with the config from google-services.json
      const firebaseConfig = {
        projectId: 'eskici-b4403',
        appId: '1:920106141191:android:505784d0ec5bff5a470ca2',
        apiKey: 'AIzaSyDgZI5EwlbbUdoqxzooTBIJUIGneij-sf4',
        messagingSenderId: '920106141191',
        databaseURL: 'https://eskici-b4403-default-rtdb.firebaseio.com',
        storageBucket: 'eskici-b4403.firebasestorage.app'
      };
      
      try {
        // Check if already initialized
        firebaseApp = firebase.app();
        console.log('✅ Firebase already initialized');
      } catch (appError: any) {
        // Initialize if not already done
        try {
          firebaseApp = firebase.initializeApp(firebaseConfig);
          console.log('✅ Firebase manually initialized successfully');
        } catch (initError: any) {
          console.log('⚠️ Manual Firebase initialization failed:', initError?.message);
          
          // Try to get the default app one more time
          try {
            firebaseApp = firebase.app();
            console.log('✅ Firebase default app found after manual init attempt');
          } catch (finalError: any) {
            console.log('⚠️ All Firebase initialization attempts failed:', finalError?.message);
            return null;
          }
        }
      }
      
      // Get FCM token for testing
      try {
        const messaging = require('@react-native-firebase/messaging').default;
        console.log('🔥 Attempting to get FCM token...');
        
        // Set up background message handler
        messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
          console.log('📥 Message handled in the background!', remoteMessage);
        });
        
        // Request permissions for iOS (Android doesn't need this)
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === 1 || // authorized (iOS)
          authStatus === 2;   // provisional (iOS)
          
        if (enabled) {
          console.log('🔔 Push notification authorization status:', authStatus);
        }
        
        const fcmToken = await messaging().getToken();
        console.log('🔥 FCM TOKEN FOR FIREBASE CONSOLE:', fcmToken);
        console.log('📋 COPY THIS FCM TOKEN FOR TESTING ⬆️');
        console.log('🔥 Use this token in Firebase Console > Cloud Messaging > Send test message');
        
        // Set up foreground message listener
        messaging().onMessage(async (remoteMessage: any) => {
          console.log('📥 Foreground message received!', remoteMessage);
        });
        
        return fcmToken;
      } catch (fcmError: any) {
        console.log('⚠️ Could not get FCM token:', fcmError?.message || 'Unknown error');
      }
      
      return firebaseApp;
    } catch (error: any) {
      console.log('⚠️ Firebase initialization failed:', error?.message || 'Unknown error');
      console.log('📝 This is expected if google-services.json is not configured yet');
      return null;
    }
  }
  
  console.log('ℹ️ Firebase initialization skipped for non-Android platform');
  return null;
};

export const getFirebaseApp = () => firebaseApp;

export const isFirebaseAvailable = () => firebaseApp !== null;
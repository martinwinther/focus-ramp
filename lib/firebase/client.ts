import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firebaseFirestore: Firestore | undefined;

function initializeFirebase() {
  if (typeof window === 'undefined') {
    return;
  }

  // Check if already initialized
  if (firebaseApp) {
    return;
  }

  try {
    if (getApps().length === 0) {
      if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
        console.warn('Firebase configuration is missing. Please check your environment variables.');
        return;
      }
      firebaseApp = initializeApp(firebaseConfig);
    } else {
      firebaseApp = getApps()[0];
    }

    if (firebaseApp) {
      firebaseAuth = getAuth(firebaseApp);
      firebaseFirestore = getFirestore(firebaseApp);
    }
  } catch (error) {
    console.error('Error initializing Firebase:', error);
  }
}

// Initialize on client side only
// Wrap in try-catch to prevent module evaluation errors
try {
  if (typeof window !== 'undefined') {
    initializeFirebase();
  }
} catch (error) {
  // Silently fail during module evaluation
  // Firebase will be initialized when actually used via the getters
  if (typeof window !== 'undefined') {
    console.error('Failed to initialize Firebase during module load:', error);
  }
}

// Export getters that ensure initialization
export function getFirebaseApp(): FirebaseApp {
  // Only work on client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  
  if (!firebaseApp) {
    initializeFirebase();
  }
  
  if (!firebaseApp) {
    throw new Error('Firebase app is not initialized. Please check your environment variables.');
  }
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  // Only work on client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  
  if (!firebaseAuth) {
    initializeFirebase();
  }
  
  if (!firebaseAuth) {
    throw new Error('Firebase auth is not initialized. Please check your environment variables.');
  }
  return firebaseAuth;
}

export function getFirebaseFirestore(): Firestore {
  // Only work on client side
  if (typeof window === 'undefined') {
    throw new Error('Firebase can only be used on the client side.');
  }
  
  if (!firebaseFirestore) {
    initializeFirebase();
  }
  
  if (!firebaseFirestore) {
    throw new Error('Firebase firestore is not initialized. Please check your environment variables.');
  }
  return firebaseFirestore;
}

// Export direct references for backward compatibility (will be undefined on server)
export { firebaseApp, firebaseAuth, firebaseFirestore };


import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { firebaseFirestore } from '../firebase/client';

export interface UserPreferences {
  soundEnabled: boolean;
  autoStartNextSegment: boolean;
  notificationsEnabled: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

const defaultPreferences: Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'> = {
  soundEnabled: true,
  autoStartNextSegment: false,
  notificationsEnabled: false,
};

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  const prefsRef = doc(firebaseFirestore, 'userPreferences', userId);
  const prefsSnap = await getDoc(prefsRef);

  if (prefsSnap.exists()) {
    const data = prefsSnap.data();
    return {
      ...data,
      userId,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as UserPreferences;
  }

  // Create default preferences if they don't exist
  const newPrefs: UserPreferences = {
    ...defaultPreferences,
    userId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(prefsRef, {
    ...newPrefs,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return newPrefs;
}

export async function updateUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const prefsRef = doc(firebaseFirestore, 'userPreferences', userId);
  
  await updateDoc(prefsRef, {
    ...updates,
    updatedAt: new Date(),
  });
}


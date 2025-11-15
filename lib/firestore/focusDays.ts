import {
  collection,
  doc,
  writeBatch,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseFirestore } from '@/lib/firebase/client';
import type { FocusDay } from '@/lib/types/focusPlan';
import type { FocusDayPlan } from '@/lib/focus/ramp';

const FOCUS_PLANS_COLLECTION = 'focusPlans';
const DAYS_SUBCOLLECTION = 'days';

/**
 * Creates all Focus Day documents for a plan.
 * Uses batched writes to efficiently store multiple days (up to 500 per batch).
 */
export async function createFocusDaysForPlan(
  userId: string,
  planId: string,
  dayPlans: FocusDayPlan[]
): Promise<void> {
  const planRef = doc(firebaseFirestore, FOCUS_PLANS_COLLECTION, planId);
  const daysCollectionRef = collection(planRef, DAYS_SUBCOLLECTION);
  
  // Firestore batch writes support up to 500 operations per batch
  const BATCH_SIZE = 500;
  
  for (let i = 0; i < dayPlans.length; i += BATCH_SIZE) {
    const batch = writeBatch(firebaseFirestore);
    const batchDays = dayPlans.slice(i, i + BATCH_SIZE);
    
    for (const dayPlan of batchDays) {
      // Use date as document ID for easy lookup
      const dayDocRef = doc(daysCollectionRef, dayPlan.date);
      
      const dayData = {
        planId,
        userId,
        index: dayPlan.index,
        date: dayPlan.date,
        dailyTargetMinutes: dayPlan.dailyTargetMinutes,
        segments: dayPlan.segments,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      batch.set(dayDocRef, dayData);
    }
    
    await batch.commit();
  }
}

/**
 * Retrieves a Focus Day document for a specific date.
 */
export async function getFocusDayForDate(
  planId: string,
  date: string
): Promise<FocusDay | null> {
  const planRef = doc(firebaseFirestore, FOCUS_PLANS_COLLECTION, planId);
  const dayDocRef = doc(planRef, DAYS_SUBCOLLECTION, date);
  
  try {
    const { getDoc } = await import('firebase/firestore');
    const dayDoc = await getDoc(dayDocRef);
    
    if (!dayDoc.exists()) {
      return null;
    }
    
    return {
      id: dayDoc.id,
      ...dayDoc.data(),
    } as FocusDay;
  } catch (error) {
    console.error('Error fetching focus day:', error);
    return null;
  }
}

/**
 * Retrieves all Focus Days for a plan, ordered by date.
 */
export async function getAllFocusDaysForPlan(planId: string): Promise<FocusDay[]> {
  const planRef = doc(firebaseFirestore, FOCUS_PLANS_COLLECTION, planId);
  const daysCollectionRef = collection(planRef, DAYS_SUBCOLLECTION);
  
  const q = query(daysCollectionRef);
  const querySnapshot = await getDocs(q);
  
  const days: FocusDay[] = [];
  
  querySnapshot.forEach((doc) => {
    days.push({
      id: doc.id,
      ...doc.data(),
    } as FocusDay);
  });
  
  // Sort by index to ensure proper order
  days.sort((a, b) => a.index - b.index);
  
  return days;
}

/**
 * Gets the next upcoming training day from today.
 */
export async function getNextTrainingDay(planId: string): Promise<FocusDay | null> {
  const today = new Date().toISOString().split('T')[0];
  const planRef = doc(firebaseFirestore, FOCUS_PLANS_COLLECTION, planId);
  const daysCollectionRef = collection(planRef, DAYS_SUBCOLLECTION);
  
  const q = query(
    daysCollectionRef,
    where('date', '>=', today)
  );
  
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) {
    return null;
  }
  
  // Find the earliest upcoming day
  let nextDay: FocusDay | null = null;
  let earliestDate = '';
  
  querySnapshot.forEach((doc) => {
    const day = {
      id: doc.id,
      ...doc.data(),
    } as FocusDay;
    
    if (!earliestDate || day.date < earliestDate) {
      earliestDate = day.date;
      nextDay = day;
    }
  });
  
  return nextDay;
}


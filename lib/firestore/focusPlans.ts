import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { firebaseFirestore } from '@/lib/firebase/client';
import type { FocusPlan, FocusPlanConfig } from '@/lib/types/focusPlan';
import { generateFocusDayPlans } from '@/lib/focus/ramp';
import type { TrainingDayOfWeek } from '@/lib/focus/ramp';
import { createFocusDaysForPlan } from './focusDays';

const FOCUS_PLANS_COLLECTION = 'focusPlans';

export async function createFocusPlan(
  userId: string,
  config: FocusPlanConfig
): Promise<string> {
  const now = Timestamp.now();
  const startDate = new Date().toISOString().split('T')[0];

  const planData: Omit<FocusPlan, 'id'> = {
    userId,
    createdAt: now,
    updatedAt: now,
    startDate,
    targetDailyMinutes: config.targetDailyMinutes,
    trainingDaysPerWeek: config.trainingDaysPerWeek,
    status: 'active',
    startingDailyMinutes: config.startingDailyMinutes || 10,
  };

  if (config.endDate) {
    planData.endDate = config.endDate;
  }

  if (config.trainingDaysCount) {
    planData.trainingDaysCount = config.trainingDaysCount;
  }

  const docRef = await addDoc(
    collection(firebaseFirestore, FOCUS_PLANS_COLLECTION),
    {
      ...planData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  const planId = docRef.id;

  // Generate and store all Focus Days for this plan
  try {
    const rampConfig = {
      startDate,
      targetDailyMinutes: config.targetDailyMinutes,
      trainingDaysPerWeek: config.trainingDaysPerWeek as TrainingDayOfWeek[],
      startingDailyMinutes: config.startingDailyMinutes || 10,
      endDate: config.endDate,
      trainingDaysCount: config.trainingDaysCount,
    };

    const dayPlans = generateFocusDayPlans(rampConfig);
    await createFocusDaysForPlan(userId, planId, dayPlans);
  } catch (error) {
    console.error('Error generating focus days:', error);
    // TODO: Consider implementing rollback or retry logic
    // For now, the plan exists but without days - can be regenerated later
  }

  return planId;
}

export async function getActiveFocusPlanForUser(
  userId: string
): Promise<FocusPlan | null> {
  const q = query(
    collection(firebaseFirestore, FOCUS_PLANS_COLLECTION),
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    return null;
  }

  const doc = querySnapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as FocusPlan;
}


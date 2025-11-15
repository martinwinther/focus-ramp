'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isVerified: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only initialize on client side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // Dynamically import Firebase to avoid SSR issues
    Promise.all([
      import('firebase/auth'),
      import('@/lib/firebase/client'),
    ])
      .then(([{ onAuthStateChanged, signOut: firebaseSignOut }, { getFirebaseAuth }]) => {
        try {
          const auth = getFirebaseAuth();
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
          });

          // Store signOut function for later use
          (window as any).__firebaseSignOut = firebaseSignOut;
          (window as any).__getFirebaseAuth = getFirebaseAuth;

          return () => unsubscribe();
        } catch (error) {
          console.error('Error initializing Firebase Auth:', error);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error loading Firebase modules:', error);
        setLoading(false);
      });
  }, []);

  const signOut = async () => {
    try {
      const [{ signOut: firebaseSignOut }, { getFirebaseAuth }] = await Promise.all([
        import('firebase/auth'),
        import('@/lib/firebase/client'),
      ]);
      const auth = getFirebaseAuth();
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isVerified = user?.emailVerified ?? false;

  return (
    <AuthContext.Provider value={{ user, loading, isVerified, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


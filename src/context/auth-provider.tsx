
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

interface MechanicTargetUser {
  userId: string | null; // Firebase UID of the car owner, if known
  email: string;      // Email of the car owner
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  mechanicTargetUser: MechanicTargetUser | null;
  setMechanicAccess: (email: string, userId?: string | null) => void;
  clearMechanicAccess: () => void;
  effectiveUserId: string | null; // UID of the regular user or the target owner for mechanic
  isMechanicSession: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mechanicTargetUser, setMechanicTargetUser] = useState<MechanicTargetUser | null>(null);

  const setMechanicAccess = useCallback((email: string, userId?: string | null) => {
    setMechanicTargetUser({ email, userId: userId || null });
    // Ensure regular user is signed out if a mechanic session starts
    if (user) setUser(null); 
  }, [user]);

  const clearMechanicAccess = useCallback(() => {
    setMechanicTargetUser(null);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser && mechanicTargetUser) {
        // If a regular user logs in, clear any mechanic session
        clearMechanicAccess();
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, [mechanicTargetUser, clearMechanicAccess]);

  const effectiveUserId = mechanicTargetUser ? mechanicTargetUser.userId : user?.uid || null;
  const isMechanicSession = !!mechanicTargetUser;

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-xl text-foreground">Initializing AutoBook...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      mechanicTargetUser, 
      setMechanicAccess, 
      clearMechanicAccess,
      effectiveUserId,
      isMechanicSession
    }}>
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

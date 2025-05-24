'use server';

import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { EmailPasswordFormValues, SignUpFormValues } from '@/components/auth/auth-schema';

interface AuthResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

export async function signUpWithEmailPasswordAction(values: SignUpFormValues): Promise<AuthResponse> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    // Firebase errors often have a 'code' property like 'auth/email-already-in-use'
    // You might want to map these to more user-friendly messages
    return { success: false, error: error.message || 'Failed to sign up.' };
  }
}

export async function signInWithEmailPasswordAction(values: EmailPasswordFormValues): Promise<AuthResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign in.' };
  }
}

export async function signOutAction(): Promise<AuthResponse> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to sign out.' };
  }
}

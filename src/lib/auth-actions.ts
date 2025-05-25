
'use server';

import { auth, functions } from '@/lib/firebase'; // Ensure functions is imported
import { httpsCallable } from 'firebase/functions';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { EmailPasswordFormValues, SignUpFormValues } from '@/components/auth/auth-schema';
// Removed direct store import as it's not suitable for server actions

interface AuthResponse {
  success: boolean;
  userId?: string;
  error?: string;
}

interface MechanicAccessResponse {
  success: boolean;
  ownerEmail?: string;
  ownerUserId?: string; // Firebase UID of the owner
  error?: string;
}

export async function signUpWithEmailPasswordAction(values: SignUpFormValues): Promise<AuthResponse> {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
    // The createUserProfileOnSignUp Auth trigger in Cloud Functions will handle profile creation and initial access code.
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    console.error("Sign up error:", error);
    return { success: false, error: error.message || 'Failed to sign up.' };
  }
}

export async function signInWithEmailPasswordAction(values: EmailPasswordFormValues): Promise<AuthResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any)    console.error("Sign in error:", error);
    return { success: false, error: error.message || 'Failed to sign in.' };
  }
}

export async function signOutAction(): Promise<AuthResponse> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { success: false, error: error.message || 'Failed to sign out.' };
  }
}

export async function validateMechanicAccessAction(ownerEmail: string, accessCode: string): Promise<MechanicAccessResponse> {
  try {
    const validateMechanicAccessFunction = httpsCallable<{ ownerEmail: string; accessCode: string; }, MechanicAccessResponse>(functions, 'validateMechanicAccess');
    const result = await validateMechanicAccessFunction({ ownerEmail, accessCode });
    
    if (result.data.success) {
      return { 
        success: true, 
        ownerEmail: result.data.ownerEmail, 
        ownerUserId: result.data.ownerUserId 
      };
    } else {
      return { success: false, error: result.data.error || "Invalid owner email or access code." };
    }
  } catch (error: any) {
    console.error("Error calling validateMechanicAccess Cloud Function:", error);
    if (error.code === 'functions/not-found') {
         return { success: false, error: "Mechanic validation service is unavailable. Please ensure Cloud Functions are deployed." };
    }
    return { success: false, error: error.message || "Failed to validate mechanic access. Please try again." };
  }
}

// Placeholder for a client-callable action to get the owner's current access code
// This would call the 'regenerateMechanicAccessCode' Cloud Function if the owner wants a new one,
// or another function to just retrieve the current one (if we decide to show it post-generation).
export async function getMechanicAccessCodeForOwnerAction(): Promise<{ success: boolean; accessCode?: string; error?: string }> {
  if (!auth.currentUser) {
    return { success: false, error: "User not authenticated." };
  }
  try {
    const regenerateFunction = httpsCallable<void, { success: boolean; newAccessCode?: string; error?: string }>(functions, 'regenerateMechanicAccessCode');
    const result = await regenerateFunction();
    if (result.data.success && result.data.newAccessCode) {
      return { success: true, accessCode: result.data.newAccessCode };
    }
    return { success: false, error: result.data.error || "Failed to retrieve access code."};
  } catch (error: any) {
    console.error("Error calling regenerateMechanicAccessCode:", error);
    return { success: false, error: error.message || "Could not retrieve access code." };
  }
}

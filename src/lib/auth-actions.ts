
'use server';

import { auth, functions } from '@/lib/firebase'; // Ensure functions is imported
import { httpsCallable, FunctionsError } from 'firebase/functions'; // Changed HttpsError to FunctionsError
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { EmailPasswordFormValues, SignUpFormValues } from '@/components/auth/auth-schema';
// import { useAutoBookStore } from '@/lib/store'; // Server actions cannot directly access client-side Zustand store. This was a placeholder.
import type { Vehicle } from '@/types';

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
    let errorMessage = 'Failed to sign up.';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error.message === 'string') {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function signInWithEmailPasswordAction(values: EmailPasswordFormValues): Promise<AuthResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    console.error("Sign in error:", error);
    let errorMessage = 'Failed to sign in.';
    if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error.message === 'string') {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function signOutAction(): Promise<AuthResponse> {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    let errorMessage = 'Failed to sign out.';
     if (error instanceof Error) {
        errorMessage = error.message;
    } else if (typeof error.message === 'string') {
        errorMessage = error.message;
    }
    return { success: false, error: errorMessage };
  }
}

export async function validateMechanicAccessAction(ownerEmail: string, accessCode: string): Promise<MechanicAccessResponse> {
  try {
    const validateFunction = httpsCallable< { ownerEmail: string; accessCode: string }, MechanicAccessResponse>(functions, 'validateMechanicAccess');
    const result = await validateFunction({ ownerEmail, accessCode });
    
    if (result.data.success) {
      return { success: true, ownerEmail: result.data.ownerEmail, ownerUserId: result.data.ownerUserId };
    } else {
      return { success: false, error: result.data.error || "Validation failed from server." };
    }
  } catch (error: any) {
    console.error("Error calling validateMechanicAccess Cloud Function:", error);
    if (error instanceof FunctionsError) { // Changed HttpsError to FunctionsError
      return { success: false, error: `Error: ${error.message} (Code: ${error.code})` };
    }
    return { success: false, error: "An unexpected error occurred during mechanic access validation." };
  }
}


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
    return { success: false, error: result.data.error || "Failed to retrieve/regenerate access code from server."};

  } catch (error: any) {
    console.error("Error calling regenerateMechanicAccessCode Cloud Function:", error);
     if (error instanceof FunctionsError) { // Changed HttpsError to FunctionsError
      return { success: false, error: `Error: ${error.message} (Code: ${error.code})` };
    }
    return { success: false, error: "An unexpected error occurred while fetching the access code." };
  }
}


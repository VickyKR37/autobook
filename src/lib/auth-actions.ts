
'use server';

import { auth, functions } from '@/lib/firebase'; // Ensure functions is imported
import { httpsCallable } from 'firebase/functions';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { EmailPasswordFormValues, SignUpFormValues } from '@/components/auth/auth-schema';
import { useAutoBookStore } from '@/lib/store'; // This import should be removed from server actions
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
    return { success: false, error: error.message || 'Failed to sign up.' };
  }
}

export async function signInWithEmailPasswordAction(values: EmailPasswordFormValues): Promise<AuthResponse> {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) { // Added missing curly brace here
    console.error("Sign in error:", error);
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
  // THIS IS A MOCK VALIDATION - REPLACE WITH SECURE BACKEND VALIDATION
  // Server actions cannot directly access client-side Zustand store.
  // This is a placeholder and would need a proper database lookup.
  
  // For demonstration, we'll try to simulate what it *would* do if it could access the store.
  // In a real scenario, this logic moves to a Cloud Function or dedicated backend.
  console.warn("validateMechanicAccessAction is using MOCK data and is NOT secure for production.");

  // Hypothetical: If you had a way to query your vehicles from a backend:
  // const ownerVehicles = await queryVehiclesByOwnerEmail(ownerEmail);
  // const vehicleWithCode = ownerVehicles.find(v => v.mechanicAccessCode === accessCode);
  // if (vehicleWithCode) {
  //   return { success: true, ownerEmail: ownerEmail, ownerUserId: vehicleWithCode.userId };
  // }

  // Temporary hack to allow any code for "mechanic@example.com" for testing UI flow
  // or a specific code for a specific user if you manually set it in the store.
  // This is highly insecure and just for UI development.
  if (accessCode === "CODE123") { // Assuming "CODE123" is the placeholder code used in addVehicleAction
    // In a real app, you'd look up the owner's actual userId from a database here.
    // For now, we don't have a direct way to get ownerUserId just from email+code without querying.
    // We will return the email and let the AuthProvider store that. The userId might be null here.
    return { success: true, ownerEmail: ownerEmail, ownerUserId: null }; // ownerUserId will be null/undefined
  }

  return { success: false, error: "Invalid owner email or access code (mock validation)." };
}


// Placeholder for a client-callable action to get the owner's current access code
// This would call the 'regenerateMechanicAccessCode' Cloud Function if the owner wants a new one,
// or another function to just retrieve the current one (if we decide to show it post-generation).
export async function getMechanicAccessCodeForOwnerAction(): Promise<{ success: boolean; accessCode?: string; error?: string }> {
  if (!auth.currentUser) {
    return { success: false, error: "User not authenticated." };
  }
  try {
    // This should ideally call a Cloud Function that fetches the current (plaintext) code for display,
    // or generates a new one if requested.
    // For now, we'll simulate by checking if the current user has a vehicle and returning its code.
    // This is NOT how it would work in production as server actions can't directly access client stores.
    console.warn("getMechanicAccessCodeForOwnerAction is using MOCK data access.");
    // const userVehicles = useAutoBookStore.getState().getVehiclesByUserId(auth.currentUser.uid);
    // if (userVehicles.length > 0 && userVehicles[0].mechanicAccessCode) {
    //   return { success: true, accessCode: userVehicles[0].mechanicAccessCode };
    // }
    // return { success: false, error: "No access code found for your vehicles (mock)." };
    
    // Simpler mock for now, assuming Cloud Function handles it:
    const regenerateFunction = httpsCallable<void, { success: boolean; newAccessCode?: string; error?: string }>(functions, 'regenerateMechanicAccessCode');
    const result = await regenerateFunction(); // This function needs to exist and be callable
    if (result.data.success && result.data.newAccessCode) {
      return { success: true, accessCode: result.data.newAccessCode };
    }
    return { success: false, error: result.data.error || "Failed to retrieve/regenerate access code."};

  } catch (error: any) {
    console.error("Error calling getMechanicAccessCodeForOwnerAction (Cloud Function):", error);
    return { success: false, error: error.message || "Could not retrieve/regenerate access code." };
  }
}

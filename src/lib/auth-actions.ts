
'use server';

import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  // We might need Admin SDK for robust user lookup by email in a real scenario
} from 'firebase/auth';
import type { EmailPasswordFormValues, SignUpFormValues } from '@/components/auth/auth-schema';
import { useAutoBookStore } from './store'; // Cannot use client-side store directly in Server Actions

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
    // Here, you might want to create a user profile in Firestore
    // e.g., await db.collection('userProfiles').doc(userCredential.user.uid).set({ email: values.email, createdAt: new Date() });
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
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

// Placeholder for mechanic access validation
// IMPORTANT: This is a mock implementation for demonstration purposes.
// It does NOT securely validate users or access codes.
// A real implementation would require a secure backend process:
// 1. Look up the owner by email (e.g., using Firebase Admin SDK if this were a backend function, or querying a Firestore 'userProfiles' collection).
// 2. Securely compare the provided accessCode against a hashed code stored for that user.
// 3. Return the owner's Firebase UID.
export async function validateMechanicAccessAction(ownerEmail: string, accessCode: string): Promise<MechanicAccessResponse> {
  // Simulate checking against a known code and user details.
  // In a real app, you'd query your database for the user by email,
  // then verify the accessCode (ideally a hashed version).

  // For now, let's use a very simple hardcoded "master" access code for any email.
  // And we'll assume the first vehicle found with this email and code grants access.
  // This is NOT how it should be done in production.

  const MOCK_MECHANIC_ACCESS_CODE = "CODE123"; // This should match the placeholder in store.ts

  if (accessCode === MOCK_MECHANIC_ACCESS_CODE) {
    // In a real scenario, you'd fetch the user's UID from your database based on their email.
    // Since we don't have that readily available here without Admin SDK or a full user profile system,
    // we'll return success but might not have the owner's specific Firebase UID easily.
    // The client will then use the ownerEmail to filter data from the store.
    // If a `userId` was stored on vehicle records and associated with `contactDetails` (email), we could find it.
    // For this example, let's assume the email itself is sufficient for the client to filter.
    // A more robust solution would return the actual Firebase UID of the owner.
    // For now, we will search through a SIMULATED vehicle list.
    // This part is tricky because server actions cannot access client-side Zustand state.
    // To make this runnable without Firestore user profiles, we'll use a very simplified mock:

    const MOCK_OWNER_EMAIL_FOR_TESTING = "owner@example.com"; // An email you can test with
    const MOCK_OWNER_UID_FOR_TESTING = "mockOwner123"; // A placeholder UID

    if (ownerEmail.toLowerCase() === MOCK_OWNER_EMAIL_FOR_TESTING) {
        return { success: true, ownerEmail: ownerEmail, ownerUserId: MOCK_OWNER_UID_FOR_TESTING };
    } else {
        // Allow any email if code is correct, but without a specific UID.
        // This means filtering client-side by email will be essential.
        return { success: true, ownerEmail: ownerEmail, ownerUserId: undefined };
    }
  }

  return { success: false, error: "Invalid owner email or access code. (Mock validation)" };
}


'use server';

import { auth } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import type { EmailPasswordFormValues, SignUpFormValues } from '@/components/auth/auth-schema';
import { useAutoBookStore } from './store'; // Accessing store directly in server action is a temporary workaround

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

export async function validateMechanicAccessAction(ownerEmail: string, accessCode: string): Promise<MechanicAccessResponse> {
  // IMPORTANT: This is a mock implementation for demonstration purposes and uses direct store access,
  // which is NOT typical for server actions. A real implementation would query a secure backend database.
  // Access codes should be HASHED in a real database and compared securely.

  const vehiclesInStore = useAutoBookStore.getState().vehicles;
  const ownerVehicle = vehiclesInStore.find(
    (vehicle) => vehicle.contactDetails.toLowerCase() === ownerEmail.toLowerCase()
  );

  if (ownerVehicle && ownerVehicle.mechanicAccessCode === accessCode) {
    // SECURITY NOTE: In a real app, never compare plaintext access codes.
    // The provided 'accessCode' should be hashed and compared against a hashed code from the DB.
    return { success: true, ownerEmail: ownerVehicle.contactDetails, ownerUserId: ownerVehicle.userId };
  }

  return { success: false, error: "Invalid owner email or access code." };
}

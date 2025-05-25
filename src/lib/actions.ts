
'use server';

import type { Vehicle, MaintenanceLog, RepairRecord, ServiceReminder, Document, VoiceMemo } from '@/types';
import { auth } from '@/lib/firebase'; 
import { revalidatePath } from 'next/cache';

// Helper function to generate a random access code (No longer used for primary storage, but can be for display if needed)
// const generateAccessCode = (): string => {
// return Math.random().toString(36).substring(2, 8).toUpperCase();
// };

export async function addVehicleAction(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'mechanicAccessCode'> & { userId: string }): Promise<Vehicle> {
  if (!vehicleData.userId) {
    throw new Error("User ID is required to add a vehicle.");
  }

  const newVehicle: Vehicle = {
    ...vehicleData,
    id: Math.random().toString(36).substr(2, 9), // Client-generated ID, consider Firestore auto-ID if moving vehicle storage there
    userId: vehicleData.userId, 
    // mechanicAccessCode is no longer generated here. It's managed by Cloud Functions and Firestore userProfiles.
    // The 'mechanicAccessCode' field on the Vehicle type in Zustand is now primarily for potential display to the owner, not for validation.
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    motHistory: vehicleData.motHistory || [],
    fuelLogs: vehicleData.fuelLogs || [],
  };
  
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return newVehicle; 
}

export async function updateVehicleAction(vehicleData: Partial<Vehicle> & { id: string; userId: string }): Promise<Vehicle> {
  if (!vehicleData.userId) {
    throw new Error("User ID is required to update a vehicle.");
  }
  const updatedVehicle: Vehicle = {
    ...vehicleData,
    updatedAt: new Date().toISOString(),
  } as Vehicle; 
  
  revalidatePath(`/vehicles/${vehicleData.id}`);
  revalidatePath(`/vehicles`);
  revalidatePath('/dashboard');
  return updatedVehicle;
}

export async function deleteVehicleAction(vehicleId: string, userId: string): Promise<{ success: boolean }> {
  if (!userId) {
    throw new Error("User ID is required to delete a vehicle.");
  }
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function addMaintenanceLogAction(logData: Omit<MaintenanceLog, 'id' | 'createdAt'> & { userId: string }): Promise<MaintenanceLog> {
  if (!logData.userId) throw new Error("User ID is required for adding maintenance log.");

  const newLog: MaintenanceLog = {
    ...logData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${logData.vehicleId}`);
  return newLog;
}

export async function addRepairRecordAction(recordData: Omit<RepairRecord, 'id' | 'createdAt'> & { userId: string }): Promise<RepairRecord> {
  if (!recordData.userId) throw new Error("User ID is required for adding repair record.");

  const newRecord: RepairRecord = {
    ...recordData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${recordData.vehicleId}`);
  return newRecord;
}

export async function addServiceReminderAction(reminderData: Omit<ServiceReminder, 'id' | 'createdAt' | 'isCompleted'> & { userId: string }): Promise<ServiceReminder> {
  if (!reminderData.userId) throw new Error("User ID is required for adding service reminder.");
  
  const newReminder: ServiceReminder = {
    ...reminderData,
    id: Math.random().toString(36).substr(2, 9),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${reminderData.vehicleId}`);
  return newReminder;
}

export async function toggleServiceReminderAction(reminderId: string, vehicleId: string, completed: boolean, userId: string): Promise<{ success: boolean }> {
  if (!userId) throw new Error("User ID is required to toggle reminder status.");
  revalidatePath(`/vehicles/${vehicleId}`);
  return { success: true }; 
}


export async function addDocumentAction(docData: Omit<Document, 'id' | 'createdAt'> & { userId: string }): Promise<Document> {
  if (!docData.userId) throw new Error("User ID is required for adding document.");

  const newDoc: Document = {
    ...docData,
    id: Math.random().toString(36).substr(2, 9),
    fileUrl: docData.fileName ? `/uploads/placeholder/${docData.fileName}` : '/uploads/placeholder/document.pdf', 
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${docData.vehicleId}`);
  return newDoc;
}

export async function addVoiceMemoAction(memoData: Omit<VoiceMemo, 'id' | 'createdAt'> & { userId: string }): Promise<VoiceMemo> {
  if (!memoData.userId) throw new Error("User ID is required for adding voice memo.");

  const newMemo: VoiceMemo = {
    ...memoData,
    id: Math.random().toString(36).substr(2, 9),
    audioUrl: memoData.fileName ? `/uploads/placeholder/${memoData.fileName}` : '/uploads/placeholder/voicememo.mp3', 
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${memoData.vehicleId}`);
  return newMemo;
}

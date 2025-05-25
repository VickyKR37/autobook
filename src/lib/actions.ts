
'use server';

import type { Vehicle, MaintenanceLog, RepairRecord, ServiceReminder, Document, VoiceMemo } from '@/types';
// import { useAutoBookStore } from './store'; // Cannot use client-side store in server actions.
import { auth } from '@/lib/firebase'; // Import auth to get current user's UID

import { revalidatePath } from 'next/cache';


export async function addVehicleAction(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt' | 'userId' | 'mechanicAccessCode'>): Promise<Vehicle> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error("User must be authenticated to add a vehicle.");
  }

  const newVehicle: Vehicle = {
    ...vehicleData,
    id: Math.random().toString(36).substr(2, 9),
    userId: currentUser.uid, // Assign current user's UID
    mechanicAccessCode: `CODE${Math.random().toString(36).substr(2, 6).toUpperCase()}`, // Example placeholder code
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    motHistory: vehicleData.motHistory || [],
    fuelLogs: vehicleData.fuelLogs || [],
  };
  
  // In a real app, this would save to a database.
  // The client-side store will be updated by the component calling this action.
  
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return newVehicle; 
}

export async function updateVehicleAction(vehicleData: Partial<Vehicle> & { id: string }): Promise<Vehicle> {
  const updatedVehicle: Vehicle = {
    ...vehicleData,
    updatedAt: new Date().toISOString(),
  } as Vehicle; 
  
  revalidatePath(`/vehicles/${vehicleData.id}`);
  revalidatePath(`/vehicles`);
  revalidatePath('/dashboard');
  return updatedVehicle;
}

export async function deleteVehicleAction(vehicleId: string): Promise<{ success: boolean }> {
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function addMaintenanceLogAction(logData: Omit<MaintenanceLog, 'id' | 'createdAt'>): Promise<MaintenanceLog> {
  const currentUser = auth.currentUser; // Or get userId from logData if passed by mechanic
  const userIdToAdd = logData.userId || currentUser?.uid;
  if (!userIdToAdd) throw new Error("User context unclear for adding maintenance log.");


  const newLog: MaintenanceLog = {
    ...logData,
    id: Math.random().toString(36).substr(2, 9),
    userId: userIdToAdd,
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${logData.vehicleId}`);
  return newLog;
}

export async function addRepairRecordAction(recordData: Omit<RepairRecord, 'id' | 'createdAt'>): Promise<RepairRecord> {
  const currentUser = auth.currentUser;
  const userIdToAdd = recordData.userId || currentUser?.uid;
  if (!userIdToAdd) throw new Error("User context unclear for adding repair record.");

  const newRecord: RepairRecord = {
    ...recordData,
    id: Math.random().toString(36).substr(2, 9),
    userId: userIdToAdd,
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${recordData.vehicleId}`);
  return newRecord;
}

export async function addServiceReminderAction(reminderData: Omit<ServiceReminder, 'id' | 'createdAt' | 'isCompleted'>): Promise<ServiceReminder> {
  const currentUser = auth.currentUser;
  const userIdToAdd = reminderData.userId || currentUser?.uid;
  if (!userIdToAdd) throw new Error("User context unclear for adding service reminder.");
  
  const newReminder: ServiceReminder = {
    ...reminderData,
    id: Math.random().toString(36).substr(2, 9),
    isCompleted: false,
    userId: userIdToAdd,
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${reminderData.vehicleId}`);
  return newReminder;
}

export async function toggleServiceReminderAction(reminderId: string, vehicleId: string, completed: boolean): Promise<{ success: boolean }> {
  // In a real app, you'd update the database entry for this reminder.
  // You'd also check if the acting user has permission.
  revalidatePath(`/vehicles/${vehicleId}`);
  return { success: true }; 
}


export async function addDocumentAction(docData: Omit<Document, 'id' | 'createdAt'>): Promise<Document> {
  const currentUser = auth.currentUser;
  const userIdToAdd = docData.userId || currentUser?.uid;
  if (!userIdToAdd) throw new Error("User context unclear for adding document.");

  const newDoc: Document = {
    ...docData,
    id: Math.random().toString(36).substr(2, 9),
    userId: userIdToAdd,
    fileUrl: docData.fileName ? `/uploads/placeholder/${docData.fileName}` : '/uploads/placeholder/document.pdf', 
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${docData.vehicleId}`);
  return newDoc;
}

export async function addVoiceMemoAction(memoData: Omit<VoiceMemo, 'id' | 'createdAt'>): Promise<VoiceMemo> {
  const currentUser = auth.currentUser;
  const userIdToAdd = memoData.userId || currentUser?.uid;
  if (!userIdToAdd) throw new Error("User context unclear for adding voice memo.");

  const newMemo: VoiceMemo = {
    ...memoData,
    id: Math.random().toString(36).substr(2, 9),
    userId: userIdToAdd,
    audioUrl: memoData.fileName ? `/uploads/placeholder/${memoData.fileName}` : '/uploads/placeholder/voicememo.mp3', 
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${memoData.vehicleId}`);
  return newMemo;
}

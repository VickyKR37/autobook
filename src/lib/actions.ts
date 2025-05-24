'use server';

import type { Vehicle, MaintenanceLog, RepairRecord, ServiceReminder, Document, VoiceMemo } from '@/types';
import { useAutoBookStore } from './store'; // This won't work directly in server actions. State needs to be managed server-side or passed around.
                                        // For this scaffold, we'll assume store interaction happens client-side after action, or actions would update a DB.
                                        // Let's simulate by returning data that client can use to update its store.

import { revalidatePath } from 'next/cache';

// Placeholder for actual database interactions
// For now, these actions will primarily return the input data or a success message
// and rely on client-side store for UI updates or revalidatePath for refetching.

export async function addVehicleAction(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<Vehicle> {
  // In a real app, this would save to a database.
  // For the scaffold, we'll simulate ID generation and timestamps.
  const newVehicle: Vehicle = {
    ...vehicleData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    motHistory: vehicleData.motHistory || [],
    fuelLogs: vehicleData.fuelLogs || [],
  };
  // This would be where you add to your actual database.
  // useAutoBookStore.getState().addVehicle(newVehicle); // This is incorrect for server actions.
  
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return newVehicle; // Client will use this to update its Zustand store.
}

export async function updateVehicleAction(vehicleData: Partial<Vehicle> & { id: string }): Promise<Vehicle> {
  // In a real app, this would update in a database.
  const updatedVehicle: Vehicle = {
    ...vehicleData,
    updatedAt: new Date().toISOString(),
  } as Vehicle; // Cast because we know required fields are present or being updated.
  
  revalidatePath(`/vehicles/${vehicleData.id}`);
  revalidatePath(`/vehicles`);
  revalidatePath('/dashboard');
  return updatedVehicle;
}

export async function deleteVehicleAction(vehicleId: string): Promise<{ success: boolean }> {
  // In a real app, this would delete from a database.
  revalidatePath('/vehicles');
  revalidatePath('/dashboard');
  return { success: true };
}

export async function addMaintenanceLogAction(logData: Omit<MaintenanceLog, 'id' | 'createdAt'>): Promise<MaintenanceLog> {
  const newLog: MaintenanceLog = {
    ...logData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${logData.vehicleId}`);
  return newLog;
}

export async function addRepairRecordAction(recordData: Omit<RepairRecord, 'id' | 'createdAt'>): Promise<RepairRecord> {
  const newRecord: RepairRecord = {
    ...recordData,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${recordData.vehicleId}`);
  return newRecord;
}

export async function addServiceReminderAction(reminderData: Omit<ServiceReminder, 'id' | 'createdAt' | 'isCompleted'>): Promise<ServiceReminder> {
  const newReminder: ServiceReminder = {
    ...reminderData,
    id: Math.random().toString(36).substr(2, 9),
    isCompleted: false,
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${reminderData.vehicleId}`);
  return newReminder;
}

export async function toggleServiceReminderAction(reminderId: string, vehicleId: string, completed: boolean): Promise<{ success: boolean }> {
  revalidatePath(`/vehicles/${vehicleId}`);
  return { success: true }; // Client will update its store
}


export async function addDocumentAction(docData: Omit<Document, 'id' | 'createdAt'>): Promise<Document> {
  // Simulate file upload - in reality, this would involve handling FormData, saving file to storage, getting URL
  const newDoc: Document = {
    ...docData,
    id: Math.random().toString(36).substr(2, 9),
    fileUrl: docData.fileName ? `/uploads/placeholder/${docData.fileName}` : '/uploads/placeholder/document.pdf', // Placeholder URL
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${docData.vehicleId}`);
  return newDoc;
}

export async function addVoiceMemoAction(memoData: Omit<VoiceMemo, 'id' | 'createdAt'>): Promise<VoiceMemo> {
  // Simulate voice memo creation
  const newMemo: VoiceMemo = {
    ...memoData,
    id: Math.random().toString(36).substr(2, 9),
    audioUrl: memoData.fileName ? `/uploads/placeholder/${memoData.fileName}` : '/uploads/placeholder/voicememo.mp3', // Placeholder URL
    createdAt: new Date().toISOString(),
  };
  revalidatePath(`/vehicles/${memoData.vehicleId}`);
  return newMemo;
}

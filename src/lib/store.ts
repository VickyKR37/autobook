
import { create } from 'zustand';
import type { Vehicle, MaintenanceLog, RepairRecord, ServiceReminder, Document, VoiceMemo, MOTRecord, FuelLog } from '@/types';
import { immer } from 'zustand/middleware/immer';

interface AutoBookState {
  vehicles: Vehicle[];
  maintenanceLogs: MaintenanceLog[];
  repairRecords: RepairRecord[];
  serviceReminders: ServiceReminder[];
  documents: Document[];
  voiceMemos: VoiceMemo[];

  // Vehicle actions
  // userId must be included in vehicleData from the action
  addVehicle: (vehicle: Vehicle) => void; // Changed to accept full Vehicle object
  updateVehicle: (vehicle: Partial<Vehicle> & { id: string }) => void;
  deleteVehicle: (vehicleId: string, userId: string) => void; // Add userId for scoping
  getVehicleById: (vehicleId: string, userId?: string) => Vehicle | undefined; // Optional userId for filtering
  getVehiclesByUserId: (userId: string) => Vehicle[];


  // MaintenanceLog actions
  addMaintenanceLog: (log: MaintenanceLog) => void;
  updateMaintenanceLog: (log: Partial<MaintenanceLog> & { id: string }) => void;
  deleteMaintenanceLog: (logId: string, userId: string) => void;
  getMaintenanceLogsByVehicleId: (vehicleId: string, userId: string) => MaintenanceLog[];
  
  // RepairRecord actions
  addRepairRecord: (record: RepairRecord) => void;
  updateRepairRecord: (record: Partial<RepairRecord> & { id: string }) => void;
  deleteRepairRecord: (recordId: string, userId: string) => void;
  getRepairRecordsByVehicleId: (vehicleId: string, userId: string) => RepairRecord[];

  // ServiceReminder actions
  addServiceReminder: (reminder: ServiceReminder) => void;
  updateServiceReminder: (reminder: Partial<ServiceReminder> & { id: string }) => void;
  deleteServiceReminder: (reminderId: string, userId: string) => void;
  getServiceRemindersByVehicleId: (vehicleId: string, userId: string) => ServiceReminder[];
  toggleReminderCompletion: (reminderId: string, userId: string) => void;

  // Document actions
  addDocument: (doc: Document) => void;
  deleteDocument: (docId: string, userId: string) => void;
  getDocumentsByVehicleId: (vehicleId: string, userId: string) => Document[];

  // VoiceMemo actions
  addVoiceMemo: (memo: VoiceMemo) => void;
  deleteVoiceMemo: (memoId: string, userId: string) => void;
  getVoiceMemosByVehicleId: (vehicleId: string, userId: string) => VoiceMemo[];
}

// const generateId = () => Math.random().toString(36).substr(2, 9); // IDs are now generated by server actions

export const useAutoBookStore = create<AutoBookState>()(
  immer((set, get) => ({
    vehicles: [],
    maintenanceLogs: [],
    repairRecords: [],
    serviceReminders: [],
    documents: [],
    voiceMemos: [],

    addVehicle: (newVehicle) => { // Server action now provides the full Vehicle object including ID and generated access code
      set((state) => {
        state.vehicles.push(newVehicle);
      });
    },
    updateVehicle: (vehicleUpdate) => {
      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === vehicleUpdate.id && v.userId === vehicleUpdate.userId); // Check userId too
        if (index !== -1) {
          state.vehicles[index] = { ...state.vehicles[index], ...vehicleUpdate, updatedAt: new Date().toISOString() };
        }
      });
    },
    deleteVehicle: (vehicleId, userId) => { // userId ensures correct scoping
      set((state) => {
        state.vehicles = state.vehicles.filter((v) => !(v.id === vehicleId && v.userId === userId));
        // Also delete related data, ensuring userId matches
        state.maintenanceLogs = state.maintenanceLogs.filter((log) => !(log.vehicleId === vehicleId && log.userId === userId));
        state.repairRecords = state.repairRecords.filter((record) => !(record.vehicleId === vehicleId && record.userId === userId));
        state.serviceReminders = state.serviceReminders.filter((reminder) => !(reminder.vehicleId === vehicleId && reminder.userId === userId));
        state.documents = state.documents.filter((doc) => !(doc.vehicleId === vehicleId && doc.userId === userId));
        state.voiceMemos = state.voiceMemos.filter((memo) => !(memo.vehicleId === vehicleId && memo.userId === userId));
      });
    },
    getVehicleById: (vehicleId, userId) => { 
      const vehicles = get().vehicles;
      if (!Array.isArray(vehicles)) return undefined; 
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (userId && vehicle?.userId !== userId) return undefined; 
      return vehicle;
    },
    getVehiclesByUserId: (userId) => {
      const vehicles = get().vehicles;
      if (!Array.isArray(vehicles)) return []; // Defensive check
      return vehicles.filter((v) => v.userId === userId);
    },

    addMaintenanceLog: (newLog) => { 
      set((state) => {
        state.maintenanceLogs.push(newLog);
      });
    },
    updateMaintenanceLog: (logUpdate) => {
      set((state) => {
        const index = state.maintenanceLogs.findIndex((log) => log.id === logUpdate.id && log.userId === logUpdate.userId);
        if (index !== -1) {
          state.maintenanceLogs[index] = { ...state.maintenanceLogs[index], ...logUpdate };
        }
      });
    },
    deleteMaintenanceLog: (logId, userId) => {
      set((state) => {
        state.maintenanceLogs = state.maintenanceLogs.filter((log) => !(log.id === logId && log.userId === userId));
      });
    },
    getMaintenanceLogsByVehicleId: (vehicleId, userId) => { 
      const logs = get().maintenanceLogs;
      if (!Array.isArray(logs)) return []; // Defensive check
      return logs.filter((log) => log.vehicleId === vehicleId && log.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    addRepairRecord: (newRecord) => { 
      set((state) => {
        state.repairRecords.push(newRecord);
      });
    },
    updateRepairRecord: (recordUpdate) => {
       set((state) => {
        const index = state.repairRecords.findIndex((record) => record.id === recordUpdate.id && record.userId === recordUpdate.userId);
        if (index !== -1) {
          state.repairRecords[index] = { ...state.repairRecords[index], ...recordUpdate };
        }
      });
    },
    deleteRepairRecord: (recordId, userId) => {
      set((state) => {
        state.repairRecords = state.repairRecords.filter((record) => !(record.id === recordId && record.userId === userId));
      });
    },
    getRepairRecordsByVehicleId: (vehicleId, userId) => { 
      const records = get().repairRecords;
      if (!Array.isArray(records)) return []; // Defensive check
      return records.filter((record) => record.vehicleId === vehicleId && record.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    
    addServiceReminder: (newReminder) => { 
      set((state) => {
        state.serviceReminders.push(newReminder);
      });
    },
    updateServiceReminder: (reminderUpdate) => {
      set((state) => {
        const index = state.serviceReminders.findIndex((r) => r.id === reminderUpdate.id && r.userId === reminderUpdate.userId);
        if (index !== -1) {
          state.serviceReminders[index] = { ...state.serviceReminders[index], ...reminderUpdate };
        }
      });
    },
    deleteServiceReminder: (reminderId, userId) => {
      set((state) => {
        state.serviceReminders = state.serviceReminders.filter((r) => !(r.id === reminderId && r.userId === userId));
      });
    },
    getServiceRemindersByVehicleId: (vehicleId, userId) => { 
      const reminders = get().serviceReminders;
      if (!Array.isArray(reminders)) return []; // Defensive check
      return reminders.filter((r) => r.vehicleId === vehicleId && r.userId === userId)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },
    toggleReminderCompletion: (reminderId, userId) => { 
      set((state) => {
        const index = state.serviceReminders.findIndex((r) => r.id === reminderId && r.userId === userId);
        if (index !== -1) {
          state.serviceReminders[index].isCompleted = !state.serviceReminders[index].isCompleted;
        }
      });
    },

    addDocument: (newDoc) => { 
      set((state) => {
        state.documents.push(newDoc);
      });
    },
    deleteDocument: (docId, userId) => {
      set((state) => {
        state.documents = state.documents.filter((doc) => !(doc.id === docId && doc.userId === userId));
      });
    },
    getDocumentsByVehicleId: (vehicleId, userId) => { 
      const documents = get().documents;
      if (!Array.isArray(documents)) return []; // Defensive check
      return documents.filter((doc) => doc.vehicleId === vehicleId && doc.userId === userId)
        .sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    },

    addVoiceMemo: (newMemo) => { 
      set((state) => {
        state.voiceMemos.push(newMemo);
      });
    },
    deleteVoiceMemo: (memoId, userId) => {
      set((state) => {
        state.voiceMemos = state.voiceMemos.filter((memo) => !(memo.id === memoId && memo.userId === userId));
      });
    },
    getVoiceMemosByVehicleId: (vehicleId, userId) => { 
      const memos = get().voiceMemos;
      if (!Array.isArray(memos)) return []; // Defensive check
      return memos.filter((memo) => memo.vehicleId === vehicleId && memo.userId === userId)
        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  }))
);

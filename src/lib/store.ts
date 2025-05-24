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
  addVehicle: (vehicle: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>) => Vehicle;
  updateVehicle: (vehicle: Partial<Vehicle> & { id: string }) => void;
  deleteVehicle: (vehicleId: string) => void;
  getVehicleById: (vehicleId: string) => Vehicle | undefined;

  // MaintenanceLog actions
  addMaintenanceLog: (log: Omit<MaintenanceLog, 'id' | 'createdAt'>) => MaintenanceLog;
  updateMaintenanceLog: (log: Partial<MaintenanceLog> & { id: string }) => void;
  deleteMaintenanceLog: (logId: string) => void;
  getMaintenanceLogsByVehicleId: (vehicleId: string) => MaintenanceLog[];
  
  // RepairRecord actions
  addRepairRecord: (record: Omit<RepairRecord, 'id' | 'createdAt'>) => RepairRecord;
  updateRepairRecord: (record: Partial<RepairRecord> & { id: string }) => void;
  deleteRepairRecord: (recordId: string) => void;
  getRepairRecordsByVehicleId: (vehicleId: string) => RepairRecord[];

  // ServiceReminder actions
  addServiceReminder: (reminder: Omit<ServiceReminder, 'id' | 'createdAt'>) => ServiceReminder;
  updateServiceReminder: (reminder: Partial<ServiceReminder> & { id: string }) => void;
  deleteServiceReminder: (reminderId: string) => void;
  getServiceRemindersByVehicleId: (vehicleId: string) => ServiceReminder[];
  toggleReminderCompletion: (reminderId: string) => void;

  // Document actions
  addDocument: (doc: Omit<Document, 'id' | 'createdAt'>) => Document;
  deleteDocument: (docId: string) => void;
  getDocumentsByVehicleId: (vehicleId: string) => Document[];

  // VoiceMemo actions
  addVoiceMemo: (memo: Omit<VoiceMemo, 'id' | 'createdAt'>) => VoiceMemo;
  deleteVoiceMemo: (memoId: string) => void;
  getVoiceMemosByVehicleId: (vehicleId: string) => VoiceMemo[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useAutoBookStore = create<AutoBookState>()(
  immer((set, get) => ({
    vehicles: [],
    maintenanceLogs: [],
    repairRecords: [],
    serviceReminders: [],
    documents: [],
    voiceMemos: [],

    addVehicle: (vehicleData) => {
      const newVehicle: Vehicle = {
        ...vehicleData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        motHistory: vehicleData.motHistory || [],
        fuelLogs: vehicleData.fuelLogs || [],
      };
      set((state) => {
        state.vehicles.push(newVehicle);
      });
      return newVehicle;
    },
    updateVehicle: (vehicleUpdate) => {
      set((state) => {
        const index = state.vehicles.findIndex((v) => v.id === vehicleUpdate.id);
        if (index !== -1) {
          state.vehicles[index] = { ...state.vehicles[index], ...vehicleUpdate, updatedAt: new Date().toISOString() };
        }
      });
    },
    deleteVehicle: (vehicleId) => {
      set((state) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== vehicleId);
        state.maintenanceLogs = state.maintenanceLogs.filter((log) => log.vehicleId !== vehicleId);
        state.repairRecords = state.repairRecords.filter((record) => record.vehicleId !== vehicleId);
        state.serviceReminders = state.serviceReminders.filter((reminder) => reminder.vehicleId !== vehicleId);
        state.documents = state.documents.filter((doc) => doc.vehicleId !== vehicleId);
        state.voiceMemos = state.voiceMemos.filter((memo) => memo.vehicleId !== vehicleId);
      });
    },
    getVehicleById: (vehicleId) => {
      return get().vehicles.find((v) => v.id === vehicleId);
    },

    addMaintenanceLog: (logData) => {
      const newLog: MaintenanceLog = {
        ...logData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        state.maintenanceLogs.push(newLog);
      });
      return newLog;
    },
    updateMaintenanceLog: (logUpdate) => {
      set((state) => {
        const index = state.maintenanceLogs.findIndex((log) => log.id === logUpdate.id);
        if (index !== -1) {
          state.maintenanceLogs[index] = { ...state.maintenanceLogs[index], ...logUpdate };
        }
      });
    },
    deleteMaintenanceLog: (logId) => {
      set((state) => {
        state.maintenanceLogs = state.maintenanceLogs.filter((log) => log.id !== logId);
      });
    },
    getMaintenanceLogsByVehicleId: (vehicleId) => {
      return get().maintenanceLogs.filter((log) => log.vehicleId === vehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    addRepairRecord: (recordData) => {
      const newRecord: RepairRecord = {
        ...recordData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        state.repairRecords.push(newRecord);
      });
      return newRecord;
    },
    updateRepairRecord: (recordUpdate) => {
       set((state) => {
        const index = state.repairRecords.findIndex((record) => record.id === recordUpdate.id);
        if (index !== -1) {
          state.repairRecords[index] = { ...state.repairRecords[index], ...recordUpdate };
        }
      });
    },
    deleteRepairRecord: (recordId) => {
      set((state) => {
        state.repairRecords = state.repairRecords.filter((record) => record.id !== recordId);
      });
    },
    getRepairRecordsByVehicleId: (vehicleId) => {
      return get().repairRecords.filter((record) => record.vehicleId === vehicleId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
    
    addServiceReminder: (reminderData) => {
      const newReminder: ServiceReminder = {
        ...reminderData,
        id: generateId(),
        isCompleted: false,
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        state.serviceReminders.push(newReminder);
      });
      return newReminder;
    },
    updateServiceReminder: (reminderUpdate) => {
      set((state) => {
        const index = state.serviceReminders.findIndex((r) => r.id === reminderUpdate.id);
        if (index !== -1) {
          state.serviceReminders[index] = { ...state.serviceReminders[index], ...reminderUpdate };
        }
      });
    },
    deleteServiceReminder: (reminderId) => {
      set((state) => {
        state.serviceReminders = state.serviceReminders.filter((r) => r.id !== reminderId);
      });
    },
    getServiceRemindersByVehicleId: (vehicleId) => {
      return get().serviceReminders.filter((r) => r.vehicleId === vehicleId).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    },
    toggleReminderCompletion: (reminderId) => {
      set((state) => {
        const index = state.serviceReminders.findIndex((r) => r.id === reminderId);
        if (index !== -1) {
          state.serviceReminders[index].isCompleted = !state.serviceReminders[index].isCompleted;
        }
      });
    },

    addDocument: (docData) => {
      const newDoc: Document = {
        ...docData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        state.documents.push(newDoc);
      });
      return newDoc;
    },
    deleteDocument: (docId) => {
      set((state) => {
        state.documents = state.documents.filter((doc) => doc.id !== docId);
      });
    },
    getDocumentsByVehicleId: (vehicleId) => {
      return get().documents.filter((doc) => doc.vehicleId === vehicleId).sort((a,b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    },

    addVoiceMemo: (memoData) => {
      const newMemo: VoiceMemo = {
        ...memoData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      set((state) => {
        state.voiceMemos.push(newMemo);
      });
      return newMemo;
    },
    deleteVoiceMemo: (memoId) => {
      set((state) => {
        state.voiceMemos = state.voiceMemos.filter((memo) => memo.id !== memoId);
      });
    },
    getVoiceMemosByVehicleId: (vehicleId) => {
      return get().voiceMemos.filter((memo) => memo.vehicleId === vehicleId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },
  }))
);

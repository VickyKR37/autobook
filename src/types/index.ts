
export interface Vehicle {
  id: string;
  userId?: string; // Firebase UID of the owner
  ownerName: string;
  contactDetails: string; // Used as owner's email for mechanic login
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  purchaseDate?: string; // ISO date string
  purchaseMileage?: number;
  currentMileage: number;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  engineSize?: string;
  fuelType?: 'Petrol' | 'Diesel' | 'Hybrid' | 'Electric' | 'Other';
  transmissionType?: 'Manual' | 'Automatic' | 'CVT' | 'Other';
  drivetrain?: 'FWD' | 'RWD' | 'AWD' | 'Other';
  batteryType?: string; // For EVs
  oilType?: string;
  coolantType?: string;
  brakeFluidType?: string;
  tireSize?: string;
  sparkPlugType?: string;
  motHistory?: MOTRecord[];
  fuelLogs?: FuelLog[];
  taxDueDate?: string; // ISO date string
  insuranceRenewalDate?: string; // ISO date string
  breakdownCoverProvider?: string;
  breakdownCoverPolicyNumber?: string;
  mechanicAccessCode?: string; // Placeholder for mechanic access
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  userId?: string; // Firebase UID of the owner
  date: string; // ISO date string
  mileage: number;
  type: string; // e.g., "Oil Change", "Tire Rotation"
  description: string;
  cost?: number;
  partsUsed?: string; // Comma-separated or JSON array
  mechanic?: string;
  createdAt: string; // ISO date string
}

export interface RepairRecord {
  id: string;
  vehicleId: string;
  userId?: string; // Firebase UID of the owner
  date: string; // ISO date string
  mileage: number;
  issue: string;
  diagnosis: string;
  workDone: string;
  mechanic?: string;
  partsReplaced?: string; // With part numbers if possible
  cost?: number;
  attachments?: FileAttachment[]; // For photos or scan reports
  createdAt: string; // ISO date string
}

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  userId?: string; // Firebase UID of the owner
  type: string; // e.g., "MOT Due", "Next Service", "Warranty Expiration"
  dueDate: string; // ISO date string
  notes?: string;
  isCompleted: boolean;
  createdAt: string; // ISO date string
}

export interface Document {
  id: string;
  vehicleId: string;
  userId?: string; // Firebase UID of the owner
  name: string;
  type: 'Insurance Certificate' | 'Logbook/V5' | 'MOT Certificate' | 'Service Book Scan' | 'Invoice/Receipt' | 'Warranty Document' | 'Other';
  uploadDate: string; // ISO date string
  fileUrl?: string; // Placeholder for actual file path/URL
  fileName?: string;
  createdAt: string; // ISO date string
}

export interface VoiceMemo {
  id: string;
  vehicleId: string;
  userId?: string; // Firebase UID of the owner
  title: string;
  date: string; // ISO date string
  transcription?: string;
  audioUrl?: string; // Placeholder for actual audio file path/URL
  fileName?: string;
  createdAt: string; // ISO date string
}

export interface MOTRecord {
  id:string;
  userId?: string; // Firebase UID of the owner
  date: string; // ISO date string
  mileage: number;
  result: 'Pass' | 'Fail' | 'Advisory';
  notes?: string;
  expiryDate?: string; // ISO date string
}

export interface FuelLog {
  id: string;
  userId?: string; // Firebase UID of the owner
  date: string; // ISO date string
  mileage: number;
  liters: number;
  cost: number;
  mpg?: number; // Calculated
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string; // Placeholder
  type: string; // e.g., 'image/jpeg', 'application/pdf'
  size: number; // in bytes
}

// Enum for fuel types for select dropdowns
export const FuelTypeOptions: { value: Vehicle['fuelType']; label: string }[] = [
  { value: 'Petrol', label: 'Petrol' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Hybrid', label: 'Hybrid' },
  { value: 'Electric', label: 'Electric' },
  { value: 'Other', label: 'Other' },
];

// Enum for transmission types
export const TransmissionTypeOptions: { value: Vehicle['transmissionType']; label: string }[] = [
  { value: 'Manual', label: 'Manual' },
  { value: 'Automatic', label: 'Automatic' },
  { value: 'CVT', label: 'CVT' },
  { value: 'Other', label: 'Other' },
];

// Enum for drivetrain types
export const DrivetrainTypeOptions: { value: Vehicle['drivetrain']; label: string }[] = [
  { value: 'FWD', label: 'FWD (Front-Wheel Drive)' },
  { value: 'RWD', label: 'RWD (Rear-Wheel Drive)' },
  { value: 'AWD', label: 'AWD (All-Wheel Drive)' },
  { value: 'Other', label: 'Other' },
];

export const DocumentTypeOptions: { value: Document['type']; label: string }[] = [
    { value: 'Insurance Certificate', label: 'Insurance Certificate' },
    { value: 'Logbook/V5', label: 'Logbook/V5' },
    { value: 'MOT Certificate', label: 'MOT Certificate' },
    { value: 'Service Book Scan', label: 'Service Book Scan' },
    { value: 'Invoice/Receipt', label: 'Invoice/Receipt' },
    { value: 'Warranty Document', label: 'Warranty Document' },
    { value: 'Other', label: 'Other' },
];

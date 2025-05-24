import { z } from 'zod';

export const vehicleFormSchema = z.object({
  ownerName: z.string().min(2, { message: "Owner name must be at least 2 characters." }),
  contactDetails: z.string().min(5, { message: "Contact details must be at least 5 characters." }),
  make: z.string().min(2, { message: "Make must be at least 2 characters." }),
  model: z.string().min(1, { message: "Model is required." }),
  year: z.coerce.number().min(1900, { message: "Year must be after 1900." }).max(new Date().getFullYear() + 1, { message: "Year cannot be in the far future." }),
  vin: z.string().length(17, { message: "VIN must be 17 characters." }).toUpperCase(),
  licensePlate: z.string().min(1, { message: "License plate is required." }).toUpperCase(),
  purchaseDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format for purchase date." }),
  purchaseMileage: z.coerce.number().optional().default(0),
  currentMileage: z.coerce.number().min(0, { message: "Current mileage cannot be negative." }),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  
  // Engine & Mechanical Specs
  engineSize: z.string().optional(),
  fuelType: z.enum(['Petrol', 'Diesel', 'Hybrid', 'Electric', 'Other']).optional(),
  transmissionType: z.enum(['Manual', 'Automatic', 'CVT', 'Other']).optional(),
  drivetrain: z.enum(['FWD', 'RWD', 'AWD', 'Other']).optional(),
  batteryType: z.string().optional(),
  oilType: z.string().optional(),
  coolantType: z.string().optional(),
  brakeFluidType: z.string().optional(),
  tireSize: z.string().optional(),
  sparkPlugType: z.string().optional(),

  // Fuel & Running Costs (subset)
  taxDueDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format for tax due date." }),
  insuranceRenewalDate: z.string().optional().refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid date format for insurance renewal date." }),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

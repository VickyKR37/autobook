'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { Vehicle } from '@/types';
import { vehicleFormSchema, type VehicleFormValues } from './vehicle-form-schema';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Save, Ban } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { FuelTypeOptions, TransmissionTypeOptions, DrivetrainTypeOptions } from '@/types';
import { useRouter } from 'next/navigation';

interface VehicleFormProps {
  initialData?: Vehicle;
  onSubmit: (data: VehicleFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export default function VehicleForm({ initialData, onSubmit, isSubmitting }: VehicleFormProps) {
  const router = useRouter();
  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: initialData ? {
      ...initialData,
      year: initialData.year || undefined,
      purchaseMileage: initialData.purchaseMileage || undefined,
      currentMileage: initialData.currentMileage || undefined,
      purchaseDate: initialData.purchaseDate ? format(parseISO(initialData.purchaseDate), 'yyyy-MM-dd') : undefined,
      taxDueDate: initialData.taxDueDate ? format(parseISO(initialData.taxDueDate), 'yyyy-MM-dd') : undefined,
      insuranceRenewalDate: initialData.insuranceRenewalDate ? format(parseISO(initialData.insuranceRenewalDate), 'yyyy-MM-dd') : undefined,
    } : {
      currentMileage: 0,
    },
  });

  const handleFormSubmit = async (values: VehicleFormValues) => {
    // Convert date strings back to ISO strings or ensure they are correctly formatted if needed by backend
    const dataToSubmit: VehicleFormValues = {
        ...values,
        purchaseDate: values.purchaseDate ? new Date(values.purchaseDate).toISOString() : undefined,
        taxDueDate: values.taxDueDate ? new Date(values.taxDueDate).toISOString() : undefined,
        insuranceRenewalDate: values.insuranceRenewalDate ? new Date(values.insuranceRenewalDate).toISOString() : undefined,
    };
    await onSubmit(dataToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Identification & Ownership</CardTitle>
            <CardDescription>Enter the core details for this vehicle.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="ownerName" render={({ field }) => (
              <FormItem>
                <FormLabel>Owner Name</FormLabel>
                <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contactDetails" render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Details</FormLabel>
                <FormControl><Input placeholder="john.doe@example.com / 0123456789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="make" render={({ field }) => (
              <FormItem>
                <FormLabel>Make</FormLabel>
                <FormControl><Input placeholder="Toyota" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="model" render={({ field }) => (
              <FormItem>
                <FormLabel>Model</FormLabel>
                <FormControl><Input placeholder="Corolla" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="year" render={({ field }) => (
              <FormItem>
                <FormLabel>Year</FormLabel>
                <FormControl><Input type="number" placeholder="2023" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="vin" render={({ field }) => (
              <FormItem>
                <FormLabel>VIN</FormLabel>
                <FormControl><Input placeholder="17-character VIN" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="licensePlate" render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl><Input placeholder="ABC 123" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="currentMileage" render={({ field }) => (
              <FormItem>
                <FormLabel>Current Mileage (km)</FormLabel>
                <FormControl><Input type="number" placeholder="50000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="purchaseDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="purchaseMileage" render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase Mileage (km)</FormLabel>
                <FormControl><Input type="number" placeholder="10000" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="insuranceProvider" render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Provider</FormLabel>
                <FormControl><Input placeholder="AutoInsure Co." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="insurancePolicyNumber" render={({ field }) => (
              <FormItem>
                <FormLabel>Insurance Policy Number</FormLabel>
                <FormControl><Input placeholder="POL123456789" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Engine & Mechanical Specs</CardTitle>
            <CardDescription>Specify technical details of the vehicle.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="engineSize" render={({ field }) => (
              <FormItem>
                <FormLabel>Engine Size/Type</FormLabel>
                <FormControl><Input placeholder="e.g., 2.0L I4 Turbo" {...field} /></FormControl>
                <FormDescription>Example: 2.0L I4, V6 3.5L</FormDescription>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="fuelType" render={({ field }) => (
              <FormItem>
                <FormLabel>Fuel Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select fuel type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {FuelTypeOptions.map(option => <SelectItem key={option.value} value={option.value!}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="transmissionType" render={({ field }) => (
              <FormItem>
                <FormLabel>Transmission Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select transmission type" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {TransmissionTypeOptions.map(option => <SelectItem key={option.value} value={option.value!}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="drivetrain" render={({ field }) => (
              <FormItem>
                <FormLabel>Drivetrain</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select drivetrain" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {DrivetrainTypeOptions.map(option => <SelectItem key={option.value} value={option.value!}>{option.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="batteryType" render={({ field }) => (
              <FormItem>
                <FormLabel>Battery Type (for EVs/Hybrids)</FormLabel>
                <FormControl><Input placeholder="e.g., 75kWh Lithium-ion" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="oilType" render={({ field }) => (
              <FormItem>
                <FormLabel>Oil Type & Viscosity</FormLabel>
                <FormControl><Input placeholder="e.g., 5W-30 Synthetic" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="coolantType" render={({ field }) => (
              <FormItem>
                <FormLabel>Coolant Type</FormLabel>
                <FormControl><Input placeholder="e.g., HOAT (Red)" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="brakeFluidType" render={({ field }) => (
              <FormItem>
                <FormLabel>Brake Fluid Type</FormLabel>
                <FormControl><Input placeholder="e.g., DOT 4" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="tireSize" render={({ field }) => (
              <FormItem>
                <FormLabel>Tire Size & Type</FormLabel>
                <FormControl><Input placeholder="e.g., 225/45R17 All-Season" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="sparkPlugType" render={({ field }) => (
              <FormItem>
                <FormLabel>Spark Plug Type</FormLabel>
                <FormControl><Input placeholder="e.g., NGK ILKAR7L11" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Renewals & Important Dates</CardTitle>
            <CardDescription>Track tax and insurance renewal dates.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="taxDueDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tax/Road Tax Due Date</FormLabel>
                 <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="insuranceRenewalDate" render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Insurance Renewal Date</FormLabel>
                 <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value ? parseISO(field.value) : undefined} onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
            <Ban className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Vehicle')}
          </Button>
        </div>
      </form>
    </Form>
  );
}

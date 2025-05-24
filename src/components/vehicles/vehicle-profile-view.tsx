'use client';

import type { Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format, parseISO } from 'date-fns';

interface VehicleProfileViewProps {
  vehicle: Vehicle;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{String(value)}</p>
    </div>
  );
};

export default function VehicleProfileView({ vehicle }: VehicleProfileViewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Vehicle Identification & Ownership</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Owner Name" value={vehicle.ownerName} />
        <DetailItem label="Contact Details" value={vehicle.contactDetails} />
        <DetailItem label="Make" value={vehicle.make} />
        <DetailItem label="Model" value={vehicle.model} />
        <DetailItem label="Year" value={vehicle.year} />
        <DetailItem label="VIN" value={vehicle.vin} />
        <DetailItem label="License Plate" value={vehicle.licensePlate} />
        <DetailItem label="Purchase Date" value={vehicle.purchaseDate ? format(parseISO(vehicle.purchaseDate), 'PPP') : 'N/A'} />
        <DetailItem label="Purchase Mileage (km)" value={vehicle.purchaseMileage?.toLocaleString() ?? 'N/A'} />
        <DetailItem label="Current Mileage (km)" value={vehicle.currentMileage.toLocaleString()} />
        <DetailItem label="Insurance Provider" value={vehicle.insuranceProvider} />
        <DetailItem label="Insurance Policy Number" value={vehicle.insurancePolicyNumber} />
        <DetailItem label="Tax/Road Tax Due Date" value={vehicle.taxDueDate ? format(parseISO(vehicle.taxDueDate), 'PPP') : 'N/A'} />
        <DetailItem label="Insurance Renewal Date" value={vehicle.insuranceRenewalDate ? format(parseISO(vehicle.insuranceRenewalDate), 'PPP') : 'N/A'} />
        <DetailItem label="Breakdown Cover Provider" value={vehicle.breakdownCoverProvider} />
        <DetailItem label="Breakdown Cover Policy Number" value={vehicle.breakdownCoverPolicyNumber} />
      </div>
    </div>
  );
}

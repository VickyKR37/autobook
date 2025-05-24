'use client';

import type { Vehicle } from '@/types';

interface EngineSpecsViewProps {
  vehicle: Vehicle;
}

const SpecItem: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base">{String(value)}</p>
    </div>
  );
};

export default function EngineSpecsView({ vehicle }: EngineSpecsViewProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Engine & Mechanical Specs</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SpecItem label="Engine Size/Type" value={vehicle.engineSize} />
        <SpecItem label="Fuel Type" value={vehicle.fuelType} />
        <SpecItem label="Transmission Type" value={vehicle.transmissionType} />
        <SpecItem label="Drivetrain" value={vehicle.drivetrain} />
        <SpecItem label="Battery Type (EV/Hybrid)" value={vehicle.batteryType} />
        <SpecItem label="Oil Type & Viscosity" value={vehicle.oilType} />
        <SpecItem label="Coolant Type" value={vehicle.coolantType} />
        <SpecItem label="Brake Fluid Type" value={vehicle.brakeFluidType} />
        <SpecItem label="Tire Size & Type" value={vehicle.tireSize} />
        <SpecItem label="Spark Plug Type" value={vehicle.sparkPlugType} />
      </div>
    </div>
  );
}

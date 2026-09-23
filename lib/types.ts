export type Role = "employee" | "admin" | "driver";

export type TripType = "single" | "round";

export type VehicleStatus = "available" | "under maintenance";

export type TripStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Employee {
  id: string;
  name: string;
  department: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  type: "Sedan" | "SUV" | "Van" | "Pickup";
  capacity: number;
  status: VehicleStatus;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  license: string;
}

export interface Location {
  name: string;
  x: number;
  y: number;
  custom?: boolean;
}

export interface RoutePoint {
  x: number;
  y: number;
}

export interface TripRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  purpose: string;
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string; // ISO date
  departureTime: string; // HH:mm
  returnDate?: string;
  returnTime?: string;
  passengers: number;
  status: TripStatus;
  createdAt: string;

  // Admin decision
  decisionReason?: string;
  decidedAt?: string;
  vehicleId?: string;
  driverId?: string;

  // Live trip
  startedAt?: string;
  completedAt?: string;
  progress?: number; // 0-100
  leg?: "outbound" | "return";
  distanceKm?: number;
  route?: RoutePoint[];
}

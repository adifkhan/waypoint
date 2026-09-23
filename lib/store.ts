import { create } from "zustand";
import { Role, TripRequest, TripStatus } from "./types";
import { genId } from "./utils";
import {
  DRIVERS,
  EMPLOYEES,
  VEHICLES,
  buildRoute,
  estimateDistanceKm,
  seedTrips,
} from "./mockData";

interface AppState {
  role: Role;
  setRole: (r: Role) => void;

  activeEmployeeId: string;
  setActiveEmployeeId: (id: string) => void;

  activeDriverId: string;
  setActiveDriverId: (id: string) => void;

  trips: TripRequest[];

  submitTrip: (input: {
    employeeId: string;
    purpose: string;
    tripType: "single" | "round";
    origin: string;
    destination: string;
    departureDate: string;
    departureTime: string;
    returnDate?: string;
    returnTime?: string;
    passengers: number;
  }) => void;

  approveTrip: (tripId: string, vehicleId: string, driverId: string) => void;
  rejectTrip: (tripId: string, reason: string) => void;
  cancelTrip: (tripId: string) => void;
  startTrip: (tripId: string) => void;
  startReturnLeg: (tripId: string) => void;
  completeTrip: (tripId: string) => void;
  tickProgress: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  role: "employee",
  setRole: (r) => set({ role: r }),

  activeEmployeeId: EMPLOYEES[0].id,
  setActiveEmployeeId: (id) => set({ activeEmployeeId: id }),

  activeDriverId: DRIVERS[0].id,
  setActiveDriverId: (id) => set({ activeDriverId: id }),

  trips: seedTrips(),

  submitTrip: (input) => {
    const employee = EMPLOYEES.find((e) => e.id === input.employeeId)!;

    const trip: TripRequest = {
      id: genId("TR"),
      employeeId: employee.id,
      employeeName: employee.name,
      department: employee.department,
      purpose: input.purpose,
      tripType: input.tripType,
      origin: input.origin,
      destination: input.destination,
      departureDate: input.departureDate,
      departureTime: input.departureTime,
      returnDate: input.returnDate,
      returnTime: input.returnTime,
      passengers: input.passengers,
      status: "pending",
      createdAt: new Date().toISOString(),
      distanceKm: estimateDistanceKm(input.origin, input.destination),
    };
    set({ trips: [trip, ...get().trips] });
  },

  approveTrip: (tripId, vehicleId, driverId) =>
    set({
      trips: get().trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: "approved" as TripStatus,
              vehicleId,
              driverId,
              decidedAt: new Date().toISOString(),
              decisionReason: undefined,
            }
          : t,
      ),
    }),

  rejectTrip: (tripId, reason) =>
    set({
      trips: get().trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: "rejected" as TripStatus,
              decisionReason: reason,
              decidedAt: new Date().toISOString(),
            }
          : t,
      ),
    }),

  cancelTrip: (tripId) =>
    set({
      trips: get().trips.map((t) =>
        t.id === tripId ? { ...t, status: "cancelled" as TripStatus } : t,
      ),
    }),

  startTrip: (tripId) =>
    set({
      trips: get().trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: "ongoing" as TripStatus,
              startedAt: new Date().toISOString(),
              progress: 0,
              leg: "outbound",
              route: buildRoute(t.origin, t.destination),
            }
          : t,
      ),
    }),

  startReturnLeg: (tripId) =>
    set({
      trips: get().trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              progress: 0,
              leg: "return",
              route: buildRoute(t.destination, t.origin),
            }
          : t,
      ),
    }),

  completeTrip: (tripId) =>
    set({
      trips: get().trips.map((t) =>
        t.id === tripId
          ? {
              ...t,
              status: "completed" as TripStatus,
              completedAt: new Date().toISOString(),
              progress: 100,
            }
          : t,
      ),
    }),

  tickProgress: () =>
    set({
      trips: get().trips.map((t) => {
        if (t.status !== "ongoing" || t.progress === undefined) return t;
        if (t.progress >= 100) return t;

        const step = 3 + Math.random() * 5;
        return { ...t, progress: Math.min(100, t.progress + step) };
      }),
    }),
}));

export const employees = EMPLOYEES;
export const drivers = DRIVERS;
export const vehicles = VEHICLES;

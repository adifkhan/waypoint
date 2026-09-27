import {
  Driver,
  Employee,
  Location,
  RoutePoint,
  TripRequest,
  Vehicle,
} from "./types";

export const LOCATIONS: Location[] = [
  { name: "Head Office (Gulshan)", x: 45, y: 56 },
  { name: "Sub-Office (Uttara)", x: 58, y: 12 },
  { name: "Sub-Office (Motijheel)", x: 68, y: 58 },
  { name: "Factory (Gazipur)", x: 30, y: 10 },
  { name: "Factory (Savar)", x: 10, y: 40 },
  { name: "Warehouse (Narayanganj)", x: 72, y: 82 },
  { name: "Client Site (Bashundhara)", x: 78, y: 30 },
  { name: "Hazrat Shahjalal Airport", x: 55, y: 25 },
];

export const CUSTOM_LOCATION_VALUE = "__custom__";

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function customLocationCoords(name: string): { x: number; y: number } {
  const h1 = hashString(name);
  const h2 = hashString(`${name}::lat`);
  const x = 10 + (h1 % 811) / 10; // 10 – 91
  const y = 12 + (h2 % 761) / 10; // 12 – 88
  return { x, y };
}

export function locationOf(name: string): Location {
  const known = LOCATIONS.find((l) => l.name === name);

  if (known) return known;
  return { name, custom: true, ...customLocationCoords(name) };
}

export function buildRoute(originName: string, destName: string): RoutePoint[] {
  const a = locationOf(originName);
  const b = locationOf(destName);
  const midX = (a.x + b.x) / 2 + (Math.random() * 10 - 5);
  const midY = (a.y + b.y) / 2 + (Math.random() * 10 - 5);
  const points: RoutePoint[] = [];
  const steps = 24;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    const x = (1 - t) * (1 - t) * a.x + 2 * (1 - t) * t * midX + t * t * b.x;
    const y = (1 - t) * (1 - t) * a.y + 2 * (1 - t) * t * midY + t * t * b.y;

    points.push({ x, y });
  }

  return points;
}

export function estimateDistanceKm(
  originName: string,
  destName: string,
): number {
  const a = locationOf(originName);
  const b = locationOf(destName);
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const raw = Math.sqrt(dx * dx + dy * dy);

  return Math.max(3, Math.round(raw * 1.6));
}

export const EMPLOYEES: Employee[] = [
  { id: "E-1001", name: "Rafiul Karim", department: "Finance" },
  { id: "E-1002", name: "Nadia Islam", department: "Human Resources" },
  { id: "E-1003", name: "Shuvo Ahmed", department: "IT & Systems" },
  { id: "E-1004", name: "Farzana Haque", department: "Procurement" },
];

export const DRIVERS: Driver[] = [
  {
    id: "D-01",
    name: "Anwar Hossain",
    phone: "+880 1711-223344",
    license: "DL-88213",
  },
  {
    id: "D-02",
    name: "Mizanur Rahman",
    phone: "+880 1819-556677",
    license: "DL-77042",
  },
  {
    id: "D-03",
    name: "Babul Sarker",
    phone: "+880 1922-889900",
    license: "DL-90116",
  },
];

export const VEHICLES: Vehicle[] = [
  {
    id: "V-01",
    name: "Fleet Car 01",
    plate: "DHAKA METRO GA 11-2201",
    type: "Sedan",
    capacity: 4,
    status: "available",
  },
  {
    id: "V-02",
    name: "Fleet SUV 02",
    plate: "DHAKA METRO HA 22-4410",
    type: "SUV",
    capacity: 6,
    status: "available",
  },
  {
    id: "V-03",
    name: "Staff Van 03",
    plate: "DHAKA METRO KHA 15-7789",
    type: "Van",
    capacity: 12,
    status: "available",
  },
  {
    id: "V-04",
    name: "Utility Pickup 04",
    plate: "DHAKA METRO GHA 09-3321",
    type: "Pickup",
    capacity: 3,
    status: "available",
  },
  {
    id: "V-05",
    name: "Utility Pickup 05",
    plate: "DHAKA METRO GHA 09-5580",
    type: "Pickup",
    capacity: 3,
    status: "under maintenance",
  },
];

const today = new Date();
const iso = (offsetDays: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
};

export function seedTrips(): TripRequest[] {
  return [
    {
      id: "TR-3001",
      employeeId: "E-1002",
      employeeName: "Nadia Islam",
      department: "Human Resources",
      purpose: "New hire onboarding paperwork at the sub-office",
      tripType: "single",
      origin: "Head Office (Gulshan)",
      destination: "Sub-Office (Uttara)",
      departureDate: iso(1),
      departureTime: "09:30",
      passengers: 2,
      status: "pending",
      createdAt: new Date(Date.now() - 3600_000 * 5).toISOString(),
      distanceKm: estimateDistanceKm(
        "Head Office (Gulshan)",
        "Sub-Office (Uttara)",
      ),
    },
    {
      id: "TR-3002",
      employeeId: "E-1003",
      employeeName: "Shuvo Ahmed",
      department: "IT & Systems",
      purpose: "Network hardware install at the Gazipur factory floor",
      tripType: "round",
      origin: "Head Office (Gulshan)",
      destination: "Factory (Gazipur)",
      departureDate: iso(0),
      departureTime: "08:00",
      returnDate: iso(0),
      returnTime: "17:00",
      passengers: 1,
      status: "approved",
      createdAt: new Date(Date.now() - 3600_000 * 26).toISOString(),
      decidedAt: new Date(Date.now() - 3600_000 * 20).toISOString(),
      vehicleId: "V-02",
      driverId: "D-01",
      distanceKm: estimateDistanceKm(
        "Head Office (Gulshan)",
        "Factory (Gazipur)",
      ),
      route: buildRoute("Head Office (Gulshan)", "Factory (Gazipur)"),
    },
    {
      id: "TR-3003",
      employeeId: "E-1004",
      employeeName: "Farzana Haque",
      department: "Procurement",
      purpose: "Vendor site inspection ahead of the Q3 supply contract",
      tripType: "single",
      origin: "Head Office (Gulshan)",
      destination: "Warehouse (Narayanganj)",
      departureDate: iso(-1),
      departureTime: "10:00",
      passengers: 1,
      status: "rejected",
      createdAt: new Date(Date.now() - 3600_000 * 50).toISOString(),
      decidedAt: new Date(Date.now() - 3600_000 * 44).toISOString(),
      decisionReason:
        "No vehicle available on this date, all fleet vehicles are booked for the audit visit. Please resubmit for the following day.",
      distanceKm: estimateDistanceKm(
        "Head Office (Gulshan)",
        "Warehouse (Narayanganj)",
      ),
    },
    {
      id: "TR-3005",
      employeeId: "E-1004",
      employeeName: "Farzana Haque",
      department: "Procurement",
      purpose: "Meet the equipment supplier near the Gazipur industrial zone",
      tripType: "single",
      origin: "Head Office (Gulshan)",
      destination: "Factory (Gazipur)",
      departureDate: iso(0),
      departureTime: "10:00",
      passengers: 1,
      status: "pending",
      createdAt: new Date(Date.now() - 3600_000 * 2).toISOString(),
      distanceKm: estimateDistanceKm(
        "Head Office (Gulshan)",
        "Factory (Gazipur)",
      ),
    },
    {
      id: "TR-2994",
      employeeId: "E-1001",
      employeeName: "Rafiul Karim",
      department: "Finance",
      purpose: "Quarterly reconciliation with the Motijheel branch team",
      tripType: "round",
      origin: "Head Office (Gulshan)",
      destination: "Sub-Office (Motijheel)",
      departureDate: iso(-3),
      departureTime: "09:00",
      returnDate: iso(-3),
      returnTime: "15:30",
      passengers: 2,
      status: "completed",
      createdAt: new Date(Date.now() - 3600_000 * 100).toISOString(),
      decidedAt: new Date(Date.now() - 3600_000 * 95).toISOString(),
      startedAt: new Date(Date.now() - 3600_000 * 80).toISOString(),
      completedAt: new Date(Date.now() - 3600_000 * 74).toISOString(),
      vehicleId: "V-01",
      driverId: "D-02",
      distanceKm: estimateDistanceKm(
        "Head Office (Gulshan)",
        "Sub-Office (Motijheel)",
      ),
      progress: 100,
    },
  ];
}

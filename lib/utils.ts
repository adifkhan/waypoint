export function formatDate(iso: string): string {
  if (!iso) return "";

  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatTime12(hhmm: string): string {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function genId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const DEFAULT_SINGLE_TRIP_BLOCK_HOURS = 3;

export interface TripWindow {
  start: Date;
  end: Date;
}
export interface Trip {
  departureDate: string;
  departureTime: string;
  tripType: string;
  returnDate?: string;
  returnTime?: string;
}

export function tripWindow(trip: Trip): TripWindow {
  const start = new Date(
    `${trip.departureDate}T${trip.departureTime || "00:00"}`,
  );
  if (trip.tripType === "round" && trip.returnDate && trip.returnTime) {
    const end = new Date(`${trip.returnDate}T${trip.returnTime}`);

    if (end > start) return { start, end };
  }
  const end = new Date(
    start.getTime() + DEFAULT_SINGLE_TRIP_BLOCK_HOURS * 60 * 60 * 1000,
  );
  return { start, end };
}

export function windowsOverlap(a: TripWindow, b: TripWindow): boolean {
  return a.start < b.end && b.start < a.end;
}

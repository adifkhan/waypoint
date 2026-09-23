"use client";

import { useMemo } from "react";
import { drivers, useAppStore } from "@/lib/store";
import TripCard from "./TripCard";
import { Flag, Phone, Play, RotateCw } from "lucide-react";
import LiveMap from "./LiveMap";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-faint">
      {children}
    </h2>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-dashed border-line px-4 py-6 text-sm text-text-faint">
      {label}
    </div>
  );
}

const DriverDashboard = () => {
  const activeDriverId = useAppStore((s) => s.activeDriverId);
  const trips = useAppStore((s) => s.trips);
  const startTrip = useAppStore((s) => s.startTrip);
  const startReturnLeg = useAppStore((s) => s.startReturnLeg);
  const completeTrip = useAppStore((s) => s.completeTrip);

  const driver = drivers.find((d) => d.id === activeDriverId)!;

  const myTrips = useMemo(
    () =>
      trips.filter(
        (t) => t.driverId === activeDriverId && t.status !== "rejected",
      ),
    [trips, activeDriverId],
  );

  const ongoing = myTrips.filter((t) => t.status === "ongoing");
  const assigned = myTrips
    .filter((t) => t.status === "approved")
    .sort((a, b) => a.departureDate.localeCompare(b.departureDate));
  const history = myTrips
    .filter((t) => t.status === "completed" || t.status === "cancelled")
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""));

  return (
    <div className="mx-auto max-w-350 px-5 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight">
          Hi {driver.name.split(" ")[0]}, ready to roll
        </h1>
        <p className="text-sm text-text-muted mt-0.5 font-mono">
          {driver.license} · {driver.phone}
        </p>
      </div>

      {ongoing.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Active trip</SectionTitle>
          {ongoing.map((trip) => {
            const atLegEnd = (trip.progress ?? 0) >= 100;
            return (
              <div
                key={trip.id}
                className="grid gap-4 lg:grid-cols-[1fr_1.3fr]"
              >
                <TripCard
                  trip={trip}
                  footer={
                    atLegEnd ? (
                      trip.tripType === "round" && trip.leg === "outbound" ? (
                        <button
                          onClick={() => startReturnLeg(trip.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-info px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
                        >
                          <RotateCw size={14} /> Start return trip
                        </button>
                      ) : (
                        <button
                          onClick={() => completeTrip(trip.id)}
                          className="inline-flex items-center gap-1.5 rounded-md bg-go px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
                        >
                          <Flag size={14} /> Complete trip
                        </button>
                      )
                    ) : (
                      <p className="text-xs text-text-faint font-mono">
                        {trip.leg === "return"
                          ? "Heading back to origin…"
                          : "Vehicle in transit…"}
                      </p>
                    )
                  }
                />
                <LiveMap trips={[trip]} highlightId={trip.id} />
              </div>
            );
          })}
        </section>
      )}

      <section className="mb-8">
        <SectionTitle>Assigned trips</SectionTitle>
        {assigned.length === 0 ? (
          <EmptyState label="No upcoming trips assigned to you yet." />
        ) : (
          <div className="space-y-3">
            {assigned.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                meta={
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-text-faint">
                    <Phone size={11} /> Requested by {trip.employeeName} ·{" "}
                    {trip.department}
                  </p>
                }
                footer={
                  <button
                    onClick={() => startTrip(trip.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-signal px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
                  >
                    <Play size={14} /> Start trip
                  </button>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <SectionTitle>Trip history</SectionTitle>
        {history.length === 0 ? (
          <EmptyState label="Trips you've completed will show up here." />
        ) : (
          <div className="space-y-3">
            {history.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DriverDashboard;

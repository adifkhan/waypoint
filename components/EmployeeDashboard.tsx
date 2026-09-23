"use client";

import { useMemo, useState } from "react";
import { employees, useAppStore } from "@/lib/store";
import { Inbox, Plus } from "lucide-react";
import TripCard from "./TripCard";
import LiveMap from "./LiveMap";
import NewTripForm from "./NewTripForm";

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
      <Inbox size={16} />
      {label}
    </div>
  );
}

const EmployeeDashboard = () => {
  const activeEmployeeId = useAppStore((s) => s.activeEmployeeId);
  const trips = useAppStore((s) => s.trips);
  const cancelTrip = useAppStore((s) => s.cancelTrip);
  const [showForm, setShowForm] = useState(false);

  const employee = employees.find((e) => e.id === activeEmployeeId)!;

  const myTrips = useMemo(
    () =>
      trips
        .filter((t) => t.employeeId === activeEmployeeId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [trips, activeEmployeeId],
  );

  const ongoing = myTrips.filter((t) => t.status === "ongoing");
  const upcoming = myTrips.filter(
    (t) => t.status === "pending" || t.status === "approved",
  );
  const past = myTrips.filter((t) =>
    ["completed", "rejected", "cancelled"].includes(t.status),
  );

  return (
    <div className="mx-auto max-w-350 px-5 py-6">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-6">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">
            Welcome back, {employee.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-text-muted mt-0.5">
            {employee.department}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-signal px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
        >
          <Plus size={15} /> Request a Trip
        </button>
      </div>

      {ongoing.length > 0 && (
        <section className="mb-6">
          <SectionTitle>Live tracking</SectionTitle>
          {ongoing.map((trip) => (
            <div
              key={trip.id}
              className="grid gap-4 lg:grid-cols-[1fr_1.3fr] mb-4"
            >
              <TripCard trip={trip} />
              <LiveMap trips={[trip]} highlightId={trip.id} />
            </div>
          ))}
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <SectionTitle>Upcoming &amp; pending</SectionTitle>
          {upcoming.length === 0 ? (
            <EmptyState label="No pending or upcoming requests." />
          ) : (
            <div className="space-y-3">
              {upcoming.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  footer={
                    trip.status === "pending" ? (
                      <button
                        onClick={() => cancelTrip(trip.id)}
                        className="text-xs font-medium text-stop hover:underline cursor-pointer"
                      >
                        Withdraw request
                      </button>
                    ) : undefined
                  }
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <SectionTitle>History</SectionTitle>
          {past.length === 0 ? (
            <EmptyState label="Completed and past trips will show up here." />
          ) : (
            <div className="space-y-3">
              {past.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          )}
        </section>
      </div>

      {showForm && <NewTripForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default EmployeeDashboard;

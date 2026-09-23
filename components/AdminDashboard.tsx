"use client";

import { drivers, useAppStore, vehicles } from "@/lib/store";
import { TripRequest } from "@/lib/types";
import { useMemo, useState } from "react";
import LiveMap from "./LiveMap";
import TripCard from "./TripCard";
import { Ban, Check, ClipboardList } from "lucide-react";
import { formatDate, formatTime12 } from "@/lib/utils";
import StatusBadge from "./StatusBadge";
import ApprovalModal from "./ApprovalModal";

type Filter =
  | "all"
  | "pending"
  | "approved"
  | "ongoing"
  | "completed"
  | "rejected";

function SectionTitle({
  children,
  noMargin,
}: {
  children: React.ReactNode;
  noMargin?: boolean;
}) {
  return (
    <h2
      className={`text-xs font-bold uppercase tracking-wider text-text-faint ${noMargin ? "" : "mb-3"}`}
    >
      {children}
    </h2>
  );
}

function StatTile({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone: "signal" | "go" | "info";
}) {
  const toneClass = { signal: "text-signal", go: "text-go", info: "text-info" }[
    tone
  ];

  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3.5">
      <p className="text-xs text-text-faint">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold font-mono ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

const AdminDashboard = () => {
  const trips = useAppStore((s) => s.trips);
  const [modal, setModal] = useState<{
    trip: TripRequest;
    mode: "approve" | "reject";
  } | null>(null);
  const [filter, setFilter] = useState<Filter>("pending");

  const pending = useMemo(
    () =>
      trips
        .filter((t) => t.status === "pending")
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [trips],
  );
  const ongoing = useMemo(
    () => trips.filter((t) => t.status === "ongoing"),
    [trips],
  );

  const filtered = useMemo(() => {
    const sorted = [...trips].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
    if (filter === "all") return sorted;
    return sorted.filter((t) => t.status === filter);
  }, [trips, filter]);

  const counts: Record<Filter, number> = {
    all: trips.length,
    pending: trips.filter((t) => t.status === "pending").length,
    approved: trips.filter((t) => t.status === "approved").length,
    ongoing: trips.filter((t) => t.status === "ongoing").length,
    completed: trips.filter((t) => t.status === "completed").length,
    rejected: trips.filter((t) => t.status === "rejected").length,
  };

  return (
    <div className="mx-auto max-w-350 px-5 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold tracking-tight">
          Dispatch overview
        </h1>
        <p className="text-sm text-text-muted mt-0.5">
          {counts.pending} request{counts.pending === 1 ? "" : "s"} awaiting
          your decision
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3 mb-6">
        <StatTile
          label="Awaiting approval"
          value={counts.pending}
          tone="signal"
        />
        <StatTile label="On the road now" value={counts.ongoing} tone="go" />
        <StatTile
          label="Fleet vehicles / drivers"
          value={`${vehicles.length} / ${drivers.length}`}
          tone="info"
        />
      </div>

      <section className="mb-8">
        <SectionTitle>Live fleet map</SectionTitle>
        <LiveMap trips={ongoing} height={380} />
      </section>

      {pending.length > 0 && (
        <section className="mb-8">
          <SectionTitle>Pending approval</SectionTitle>
          <div className="space-y-3">
            {pending.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                meta={
                  <p className="mt-2 text-xs text-text-faint">
                    Requested by{" "}
                    <span className="text-text-muted font-medium">
                      {trip.employeeName}
                    </span>{" "}
                    · {trip.department}
                  </p>
                }
                footer={
                  <>
                    <button
                      onClick={() => setModal({ trip, mode: "approve" })}
                      className="inline-flex items-center gap-1.5 rounded-md bg-go px-3 py-1.5 text-xs font-semibold text-ink hover:brightness-105 cursor-pointer"
                    >
                      <Check size={13} /> Approve
                    </button>
                    <button
                      onClick={() => setModal({ trip, mode: "reject" })}
                      className="inline-flex items-center gap-1.5 rounded-md bg-stop px-3 py-1.5 text-xs font-semibold text-ink hover:brightness-105 cursor-pointer"
                    >
                      <Ban size={13} /> Reject
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <SectionTitle noMargin>All requests</SectionTitle>
          <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-ink p-1">
            {(
              [
                "all",
                "pending",
                "approved",
                "ongoing",
                "completed",
                "rejected",
              ] as Filter[]
            ).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize cursor-pointer transition-colors ${
                  filter === f
                    ? "bg-surface-raised text-text"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {f} <span className="text-text-faint">{counts[f]}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-line console-scroll">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-surface text-left text-xs text-text-faint uppercase tracking-wide">
                <th className="px-4 py-2.5 font-medium">Trip</th>
                <th className="px-4 py-2.5 font-medium">Employee</th>
                <th className="px-4 py-2.5 font-medium">Route</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium">Vehicle / Driver</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-text-faint"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <ClipboardList size={18} />
                      No requests in this view.
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map((t) => {
                const v = vehicles.find((x) => x.id === t.vehicleId);
                const d = drivers.find((x) => x.id === t.driverId);

                return (
                  <tr
                    key={t.id}
                    className="border-b border-line-soft bg-surface hover:bg-surface-hover"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-text-muted">
                      {t.id}
                    </td>
                    <td className="px-4 py-2.5">
                      <p className="text-text font-medium">{t.employeeName}</p>
                      <p className="text-text-faint text-xs">{t.department}</p>
                    </td>
                    <td className="px-4 py-2.5 text-text-muted">
                      {t.origin} → {t.destination}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-text-muted whitespace-nowrap">
                      {formatDate(t.departureDate)}{" "}
                      {formatTime12(t.departureTime)}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-text-muted">
                      {v ? (
                        `${v.name}`
                      ) : (
                        <span className="text-text-faint">—</span>
                      )}
                      {d ? ` · ${d.name}` : ""}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={t.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {modal && (
        <ApprovalModal
          trip={modal.trip}
          mode={modal.mode}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
};

export default AdminDashboard;

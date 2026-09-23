import { useState } from "react";
import { TripRequest } from "@/lib/types";
import { drivers, useAppStore, vehicles } from "@/lib/store";
import {
  formatDate,
  formatTime12,
  tripWindow,
  windowsOverlap,
} from "@/lib/utils";
import { Ban, Check, TriangleAlert, X } from "lucide-react";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

type ApprovalModalPropsType = {
  trip: TripRequest;
  mode: "approve" | "reject";
  onClose: () => void;
};

const ApprovalModal = ({ trip, mode, onClose }: ApprovalModalPropsType) => {
  const trips = useAppStore((s) => s.trips);
  const approveTrip = useAppStore((s) => s.approveTrip);
  const rejectTrip = useAppStore((s) => s.rejectTrip);

  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const thisWindow = tripWindow(trip);
  const conflicting = trips.filter(
    (t) =>
      t.id !== trip.id &&
      (t.status === "approved" || t.status === "ongoing") &&
      windowsOverlap(thisWindow, tripWindow(t)),
  );

  const busyVehicles = new Map(
    conflicting
      .filter((t) => t.vehicleId)
      .map((t) => [t.vehicleId as string, t]),
  );

  const busyDrivers = new Map(
    conflicting.filter((t) => t.driverId).map((t) => [t.driverId as string, t]),
  );

  function handleApprove() {
    if (!vehicleId || !driverId) {
      setError("Select both a vehicle and a driver to approve this trip.");
      return;
    }
    if (busyVehicles.has(vehicleId)) {
      setError(
        "That vehicle is already assigned to an overlapping trip. Pick another.",
      );
      return;
    }
    if (busyDrivers.has(driverId)) {
      setError(
        "That driver is already assigned to an overlapping trip. Pick another.",
      );
      return;
    }
    approveTrip(trip.id, vehicleId, driverId);
    onClose();
  }

  function handleReject() {
    if (!reason.trim()) {
      setError("Add a reason so the employee understands why it was rejected.");
      return;
    }
    rejectTrip(trip.id, reason.trim());
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-line bg-surface shadow-2xl max-h-[90vh] overflow-y-auto console-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4 sticky top-0 bg-surface">
          <div>
            <h2 className="font-bold text-text">
              {mode === "approve" ? "Approve request" : "Reject request"}
            </h2>
            <p className="text-xs text-text-faint mt-0.5 font-mono">
              {trip.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-faint hover:text-text hover:bg-surface-raised cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div className="rounded-lg border border-line-soft bg-ink px-3 py-2.5 text-sm">
            <p className="font-semibold text-text">
              {trip.employeeName}{" "}
              <span className="text-text-faint font-normal">
                · {trip.department}
              </span>
            </p>
            <p className="text-text-muted mt-0.5">
              {trip.origin} → {trip.destination}
            </p>
            <p className="text-text-faint text-xs font-mono mt-1">
              {formatDate(trip.departureDate)} ·{" "}
              {formatTime12(trip.departureTime)}
              {trip.returnTime ? ` – ${formatTime12(trip.returnTime)}` : ""}
            </p>
          </div>

          {mode === "approve" ? (
            <>
              <Field label="Assign vehicle">
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
                >
                  <option value="">Select a vehicle…</option>
                  {vehicles.map((v) => {
                    const conflict = busyVehicles.get(v.id);
                    const notAvailable = v.status != "available";

                    return (
                      <option
                        key={v.id}
                        value={v.id}
                        disabled={!!conflict || notAvailable}
                      >
                        {v.name} · {v.plate} · seats {v.capacity}
                        {conflict ? ` (busy on ${conflict.id})` : ""}
                      </option>
                    );
                  })}
                </select>
              </Field>

              <Field label="Assign driver">
                <select
                  value={driverId}
                  onChange={(e) => setDriverId(e.target.value)}
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
                >
                  <option value="">Select a driver…</option>
                  {drivers.map((d) => {
                    const conflict = busyDrivers.get(d.id);
                    return (
                      <option key={d.id} value={d.id} disabled={!!conflict}>
                        {d.name} · {d.license}
                        {conflict ? ` (busy on ${conflict.id})` : ""}
                      </option>
                    );
                  })}
                </select>
              </Field>

              {trip.passengers > 0 &&
                vehicleId &&
                (() => {
                  const v = vehicles.find((x) => x.id === vehicleId);
                  if (v && v.capacity < trip.passengers) {
                    return (
                      <p className="flex items-center gap-1.5 text-xs text-signal">
                        <TriangleAlert size={13} /> This vehicle seats{" "}
                        {v.capacity}, request is for {trip.passengers}{" "}
                        passengers.
                      </p>
                    );
                  }
                  return null;
                })()}
            </>
          ) : (
            <Field label="Reason for rejection">
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="e.g. No vehicle available on this date - please resubmit for another day."
                className="w-full resize-none rounded-md border border-line bg-ink px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-signal/40"
              />
            </Field>
          )}

          {error && <p className="text-xs text-stop">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-text-muted hover:text-text cursor-pointer"
            >
              Cancel
            </button>

            {mode === "approve" ? (
              <button
                onClick={handleApprove}
                className="inline-flex items-center gap-1.5 rounded-md bg-go px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
              >
                <Check size={14} /> Approve trip
              </button>
            ) : (
              <button
                onClick={handleReject}
                className="inline-flex items-center gap-1.5 rounded-md bg-stop px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
              >
                <Ban size={14} /> Reject trip
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalModal;

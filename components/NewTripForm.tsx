import React, { useState } from "react";
import { useAppStore } from "@/lib/store";
import { TripType } from "@/lib/types";
import { CUSTOM_LOCATION_VALUE, LOCATIONS } from "@/lib/mockData";
import { Send, X } from "lucide-react";

function LocationInput({
  selectValue,
  onSelectChange,
  customValue,
  onCustomChange,
  customPlaceholder,
}: {
  selectValue: string;
  onSelectChange: (v: string) => void;
  customValue: string;
  onCustomChange: (v: string) => void;
  customPlaceholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <select
        value={selectValue}
        onChange={(e) => onSelectChange(e.target.value)}
        className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
      >
        <option value={CUSTOM_LOCATION_VALUE}>Type an address…</option>
        {LOCATIONS.map((l) => (
          <option key={l.name} value={l.name}>
            {l.name}
          </option>
        ))}
      </select>
      {selectValue === CUSTOM_LOCATION_VALUE && (
        <input
          type="text"
          value={customValue}
          onChange={(e) => onCustomChange(e.target.value)}
          placeholder={customPlaceholder}
          className="w-full rounded-md border border-signal/40 bg-ink px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-signal/40"
        />
      )}
    </div>
  );
}

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

const NewTripForm = ({ onClose }: { onClose: () => void }) => {
  const activeEmployeeId = useAppStore((s) => s.activeEmployeeId);
  const submitTrip = useAppStore((s) => s.submitTrip);

  const [tripType, setTripType] = useState<TripType>("single");
  const [purpose, setPurpose] = useState("");

  const [originSelect, setOriginSelect] = useState(LOCATIONS[0].name);
  const [originCustom, setOriginCustom] = useState("");
  const [destinationSelect, setDestinationSelect] = useState(LOCATIONS[1].name);
  const [destinationCustom, setDestinationCustom] = useState("");

  const [departureDate, setDepartureDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [departureTime, setDepartureTime] = useState("09:00");
  const [returnDate, setReturnDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [returnTime, setReturnTime] = useState("17:00");
  const [passengers, setPassengers] = useState(1);
  const [error, setError] = useState("");

  const origin =
    originSelect === CUSTOM_LOCATION_VALUE ? originCustom.trim() : originSelect;
  const destination =
    destinationSelect === CUSTOM_LOCATION_VALUE
      ? destinationCustom.trim()
      : destinationSelect;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!purpose.trim()) {
      setError("Add a short purpose so admin knows what the trip is for.");
      return;
    }
    if (originSelect === CUSTOM_LOCATION_VALUE && !originCustom.trim()) {
      setError(
        "Type the pickup address, since it isn't one of the listed sites.",
      );
      return;
    }
    if (
      destinationSelect === CUSTOM_LOCATION_VALUE &&
      !destinationCustom.trim()
    ) {
      setError(
        "Type the destination address, since it isn't one of the listed sites.",
      );
      return;
    }
    if (origin.toLowerCase() === destination.toLowerCase()) {
      setError("Origin and destination can't be the same place.");
      return;
    }
    submitTrip({
      employeeId: activeEmployeeId,
      purpose: purpose.trim(),
      tripType,
      origin,
      destination,
      departureDate,
      departureTime,
      returnDate: tripType === "round" ? returnDate : undefined,
      returnTime: tripType === "round" ? returnTime : undefined,
      passengers,
    });
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
          <h2 className="font-bold text-text">New transport request</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-text-faint hover:text-text hover:bg-surface-raised cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-5 py-4 space-y-4">
          <div className="flex rounded-lg border border-line bg-ink p-1">
            {(["single", "round"] as TripType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(t)}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium capitalize cursor-pointer transition-colors ${
                  tripType === t
                    ? "bg-surface-raised text-text"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {t} trip
              </button>
            ))}
          </div>

          <Field label="Purpose of visit">
            <textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              rows={2}
              placeholder="e.g. Vendor site inspection for the Q3 supply contract"
              className="w-full resize-none rounded-md border border-line bg-ink px-3 py-2 text-sm text-text placeholder:text-text-faint focus:outline-none focus:ring-2 focus:ring-signal/40"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Origin">
              <LocationInput
                selectValue={originSelect}
                onSelectChange={setOriginSelect}
                customValue={originCustom}
                onCustomChange={setOriginCustom}
                customPlaceholder="e.g. 14 Kemal Ataturk Ave, Banani"
              />
            </Field>
            <Field label="Destination">
              <LocationInput
                selectValue={destinationSelect}
                onSelectChange={setDestinationSelect}
                customValue={destinationCustom}
                onCustomChange={setDestinationCustom}
                customPlaceholder="e.g. Client warehouse, Konabari Rd, Gazipur"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Departure date">
              <input
                type="date"
                value={departureDate}
                onChange={(e) => setDepartureDate(e.target.value)}
                className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
              />
            </Field>
            <Field label="Departure time">
              <input
                type="time"
                value={departureTime}
                onChange={(e) => setDepartureTime(e.target.value)}
                className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
              />
            </Field>
          </div>

          {tripType === "round" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Return date">
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
                />
              </Field>
              <Field label="Return time">
                <input
                  type="time"
                  value={returnTime}
                  onChange={(e) => setReturnTime(e.target.value)}
                  className="w-full rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
                />
              </Field>
            </div>
          )}

          <Field label="Passengers (including yourself)">
            <input
              type="number"
              min={1}
              max={10}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              className="w-24 rounded-md border border-line bg-ink px-3 py-2 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40"
            />
          </Field>

          {error && <p className="text-xs text-stop">{error}</p>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-3.5 py-2 text-sm font-medium text-text-muted hover:text-text cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-md bg-signal px-3.5 py-2 text-sm font-semibold text-ink hover:brightness-105 cursor-pointer"
            >
              <Send size={14} /> Submit request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewTripForm;

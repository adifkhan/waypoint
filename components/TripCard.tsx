import { drivers, vehicles } from "@/lib/store";
import { TripRequest } from "@/lib/types";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  LineDotRightHorizontal,
  RotateCw,
  Users,
} from "lucide-react";
import React from "react";
import StatusBadge from "./StatusBadge";
import { formatDate, formatTime12 } from "@/lib/utils";

type TripCardPropsType = {
  trip: TripRequest;
  footer?: React.ReactNode;
  meta?: React.ReactNode;
};

const TripCard = ({ trip, footer, meta }: TripCardPropsType) => {
  const vehicle = vehicles.find((v) => v.id === trip.vehicleId);
  const driver = drivers.find((d) => d.id === trip.driverId);

  const trip_type =
    trip.tripType === "round" ? (
      <>
        <RotateCw size={10} /> Round trip
      </>
    ) : (
      <>
        <LineDotRightHorizontal size={10} /> Single trip
      </>
    );

  return (
    <div className="rounded-xl border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-text-faint">
            <span>{trip.id}</span>
            <span className="inline-flex items-center gap-1 text-info">
              {trip_type}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-text">
            <span>{trip.origin}</span>
            <ArrowRight size={13} className="text-text-faint shrink-0" />
            <span>{trip.destination}</span>
          </p>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      <p className="mt-2 text-sm text-text-muted leading-snug">
        {trip.purpose}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted font-mono">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays size={12} /> {formatDate(trip.departureDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={12} /> {formatTime12(trip.departureTime)}
          {trip.returnTime ? ` – ${formatTime12(trip.returnTime)}` : ""}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Users size={12} /> {trip.passengers} passenger
          {trip.passengers > 1 ? "s" : ""}
        </span>
        {trip.distanceKm && <span>~{trip.distanceKm} km</span>}
      </div>

      {(vehicle || driver) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {vehicle && (
            <span className="rounded-md border border-line bg-surface-raised px-2 py-1 text-[11px] font-mono text-text-muted">
              {vehicle.name} · {vehicle.plate}
            </span>
          )}
          {driver && (
            <span className="rounded-md border border-line bg-surface-raised px-2 py-1 text-[11px] font-mono text-text-muted">
              Driver: {driver.name}
            </span>
          )}
        </div>
      )}

      {trip.status === "rejected" && trip.decisionReason && (
        <div className="mt-3 rounded-md border border-stop/30 bg-stop-soft px-3 py-2 text-xs text-stop leading-relaxed">
          {trip.decisionReason}
        </div>
      )}

      {trip.status === "ongoing" && typeof trip.progress === "number" && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] font-mono text-text-faint mb-1">
            <span>{trip.leg === "return" ? "Returning" : "En route"}</span>
            <span>{Math.round(trip.progress)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-raised overflow-hidden">
            <div
              className="h-full rounded-full bg-go transition-all duration-700 ease-linear"
              style={{ width: `${trip.progress}%` }}
            />
          </div>
        </div>
      )}

      {meta}
      {footer && (
        <div className="mt-3 pt-3 border-t border-line-soft flex flex-wrap gap-2">
          {footer}
        </div>
      )}
    </div>
  );
};

export default TripCard;

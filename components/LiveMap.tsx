"use client";

import React from "react";
import { RoutePoint, TripRequest } from "@/lib/types";
import { locationOf, LOCATIONS } from "@/lib/mockData";

function pointAt(
  route: RoutePoint[] | undefined,
  progress: number | undefined,
): RoutePoint | null {
  if (!route || route.length === 0) return null;
  const p = Math.max(0, Math.min(100, progress ?? 0));
  const idx = Math.round((p / 100) * (route.length - 1));
  return route[idx];
}

function routeToPath(route: RoutePoint[]): string {
  return route
    .map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
    .join(" ");
}

function EndpointPin({
  loc,
  kind,
}: {
  loc: { x: number; y: number; custom?: boolean };
  kind: "origin" | "destination";
}) {
  const color = kind === "origin" ? "var(--info)" : "var(--signal)";
  if (loc.custom) {
    return (
      <g>
        <circle
          cx={loc.x}
          cy={loc.y}
          r={1.6}
          fill="none"
          stroke={color}
          strokeWidth={0.4}
          strokeDasharray="0.8 0.8"
        />
        <circle cx={loc.x} cy={loc.y} r={0.5} fill={color} />
      </g>
    );
  }

  return (
    <circle
      cx={loc.x}
      cy={loc.y}
      r={1.7}
      fill="none"
      stroke={color}
      strokeWidth={0.35}
      opacity={0.85}
    />
  );
}

type LiveMapPropsType = {
  trips: TripRequest[];
  highlightId?: string;
  height?: number;
};
const LiveMap = ({ trips, highlightId, height = 340 }: LiveMapPropsType) => {
  const active = trips.filter((t) => t.route && t.status === "ongoing");
  const focusTrips = active.filter((t) => !highlightId || t.id === highlightId);

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-line bg-surface"
      style={{ height }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <pattern
            id="grid"
            width="6.25"
            height="6.25"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 6.25 0 L 0 0 0 6.25"
              fill="none"
              stroke="var(--line-soft)"
              strokeWidth="0.15"
            />
          </pattern>
          <marker
            id="arrow"
            markerWidth="6"
            markerHeight="6"
            refX="3"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L6,3 L0,6 z" fill="var(--text-faint)" />
          </marker>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />

        {/* static site nodes */}
        {LOCATIONS.map((loc) => (
          <g key={loc.name}>
            <circle
              cx={loc.x}
              cy={loc.y}
              r={1.1}
              fill="var(--surface-raised)"
              stroke="var(--line)"
              strokeWidth="0.4"
            />
            <circle cx={loc.x} cy={loc.y} r={0.35} fill="var(--text-faint)" />
          </g>
        ))}

        {/* routes + moving markers */}
        {active.map((t) => {
          const isFocus = highlightId ? t.id === highlightId : true;
          const pos = pointAt(t.route, t.progress);
          if (!t.route || !pos) return null;

          return (
            <g key={t.id} opacity={isFocus ? 1 : 0.35}>
              <path
                d={routeToPath(t.route)}
                fill="none"
                stroke="var(--signal)"
                strokeWidth={isFocus ? 0.55 : 0.35}
                strokeDasharray="1.6 1.4"
                strokeLinecap="round"
                opacity={0.8}
              />
              {/* traveled portion */}
              <path
                d={routeToPath(
                  t.route.slice(
                    0,
                    Math.max(
                      2,
                      Math.round(
                        ((t.progress ?? 0) / 100) * (t.route.length - 1),
                      ) + 1,
                    ),
                  ),
                )}
                fill="none"
                stroke="var(--go)"
                strokeWidth={isFocus ? 0.6 : 0.4}
                strokeLinecap="round"
              />
              {isFocus && (
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={2.1}
                  fill="var(--go)"
                  opacity={0.25}
                >
                  <animate
                    attributeName="r"
                    values="1.6;3;1.6"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.35;0;0.35"
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                </circle>
              )}
              <circle
                cx={pos.x}
                cy={pos.y}
                r={1.15}
                fill="var(--go)"
                stroke="var(--ink)"
                strokeWidth="0.35"
              />
            </g>
          );
        })}

        {focusTrips.map((t) => {
          const from = locationOf(
            t.leg === "return" ? t.destination : t.origin,
          );
          const to = locationOf(t.leg === "return" ? t.origin : t.destination);
          return (
            <g key={`${t.id}-endpoints`}>
              <EndpointPin loc={from} kind="origin" />
              <EndpointPin loc={to} kind="destination" />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {LOCATIONS.map((loc) => (
          <span
            key={loc.name}
            className="absolute -translate-x-1/2 translate-y-2 whitespace-nowrap text-[10px] font-mono text-text-faint"
            style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
          >
            {loc.name}
          </span>
        ))}
        {focusTrips.flatMap((t) => {
          const from = locationOf(
            t.leg === "return" ? t.destination : t.origin,
          );
          const to = locationOf(t.leg === "return" ? t.origin : t.destination);
          return [from, to]
            .filter((loc) => loc.custom)
            .map((loc) => (
              <span
                key={`${t.id}-${loc.name}`}
                className="absolute -translate-x-1/2 translate-y-2 max-w-[40%] whitespace-nowrap overflow-hidden text-ellipsis text-[10px] font-mono text-signal"
                style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                title={loc.name}
              >
                {loc.name}
              </span>
            ));
        })}
        {active
          .filter((t) => !highlightId || t.id === highlightId)
          .map((t) => {
            const pos = pointAt(t.route, t.progress);
            if (!pos) return null;
            return (
              <div
                key={t.id}
                className="absolute -translate-x-1/2 translate-y-[-130%] rounded-md border border-go/40 bg-go-soft px-1.5 py-0.5 text-[10px] font-mono text-go whitespace-nowrap"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              >
                {Math.round(t.progress ?? 0)}%
              </div>
            );
          })}
      </div>

      {active.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-text-faint font-mono">
            No vehicle currently on the road
          </p>
        </div>
      )}
    </div>
  );
};

export default LiveMap;

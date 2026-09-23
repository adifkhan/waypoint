# Waypoint — Fleet Dispatch Console (Prototype)

A Next.js prototype for internal company transport requests: employees request a
vehicle for a single or round trip, admin approves/rejects and assigns a vehicle +
driver, and drivers run the trip with a simulated live map the requester can watch
in real time.

This is a **frontend-only prototype**. There is no backend/database — all data
(trip requests, vehicles, drivers) lives in an in-memory Zustand store and resets
on page refresh. It's built to demonstrate the full workflow and UI/UX, ready to
be wired up to a real API and a real map provider (Google Maps / Mapbox) later.

## Running it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Use the role switcher in the top-right of the
header to jump between **Employee**, **Admin**, and **Driver** views — this
simulates three different logged-in users in one app so you can see the whole
flow without separate accounts.

## The workflow

1. **Employee** — submits a single or round-trip request (purpose, origin,
   destination, date/time, passenger count). It appears as "Awaiting approval."
2. **Admin** — sees the request in the approval queue, and either:
   - **Approves** it, assigning an available vehicle and driver for that date
     (vehicles/drivers already booked that day are flagged busy), or
   - **Rejects** it with a required reason, visible to the employee.
3. **Driver** — sees the trip once approved, taps **Start trip** to begin. The
   vehicle's position animates along a simulated route on the console map in
   real time. For round trips, on arrival the driver taps **Start return trip**
   to run the return leg.
4. Either party watches progress live: the **Employee** view shows a live map
   for their own ongoing trip, and the **Admin** view shows a fleet-wide map of
   every vehicle currently on the road.
5. **Driver** taps **Complete trip** once done — this closes out the trip and
   moves it into trip history for the employee, driver, and admin.

## Notes on the map

Since this prototype has no external mapping API key, "real-time tracking" is
simulated on a stylized SVG console map with fixed site markers (head office,
sub-offices, factories, warehouse, client site) and an animated route + marker.
The data model (`lib/types.ts`) already separates route/position data cleanly,
so swapping in Google Maps/Mapbox and real GPS pings later is a matter of
replacing `components/LiveMap.tsx` — no other component needs to change.

## Project structure

```
app/                   Next.js App Router entry (layout, page, global styles)
components/             UI: dashboards per role, trip cards, forms, modals, map
lib/
  types.ts              Domain model (TripRequest, Vehicle, Driver, ...)
  store.ts              Zustand store — all app state + actions
  mockData.ts            Seed employees/drivers/vehicles/locations + demo trips
  utils.ts              Formatting helpers
  useTripTicker.ts       Interval hook that advances simulated GPS progress
```

## What's stubbed for a real build-out

- **Auth** — role switcher stands in for real login/SSO.
- **Persistence** — swap the Zustand store's in-memory state for API calls to a
  real backend (trip CRUD, approval, assignment, live position feed).
- **Live GPS** — replace `tickProgress` in `lib/store.ts` with real driver-app
  location pings (e.g. over WebSockets), and `LiveMap.tsx` with a real map SDK.
- **Notifications** — approvals/rejections/trip-start events are natural
  candidates for push/email/SMS notifications.

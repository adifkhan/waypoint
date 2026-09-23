"use client";

import AdminDashboard from "@/components/AdminDashboard";
import DriverDashboard from "@/components/DriverDashboard";
import EmployeeDashboard from "@/components/EmployeeDashboard";
import Header from "@/components/Header";
import { useTripTicker } from "@/hooks/useTripTicker";
import { useAppStore } from "@/lib/store";

export default function Home() {
  const role = useAppStore((s) => s.role);
  useTripTicker();

  return (
    <>
      <Header />

      <main className="flex-1 bg-ink">
        {role === "employee" && <EmployeeDashboard />}
        {role === "admin" && <AdminDashboard />}
        {role === "driver" && <DriverDashboard />}
      </main>

      <footer className="border-t border-line px-5 py-3 text-center text-[11px] text-text-faint font-mono">
        Waypoint · internal prototype · simulated data · resets on refresh
      </footer>
    </>
  );
}

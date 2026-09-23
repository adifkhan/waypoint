import { drivers, employees, useAppStore } from "@/lib/store";
import { Role } from "@/lib/types";
import { cx } from "@/lib/utils";
import { Briefcase, Car, Navigation, ShieldCheck } from "lucide-react";

const ROLE_TABS: { id: Role; label: string; icon: React.ElementType }[] = [
  { id: "employee", label: "Employee", icon: Briefcase },
  { id: "admin", label: "Admin", icon: ShieldCheck },
  { id: "driver", label: "Driver", icon: Car },
];

function IdentityPicker({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (id: string) => void;
  options: { id: string; label: string; sub: string }[];
}) {
  return (
    <label className="flex items-center gap-2 text-xs">
      <span className="text-text-faint hidden md:inline">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-line bg-ink px-2.5 py-1.5 text-sm text-text focus:outline-none focus:ring-2 focus:ring-signal/40 cursor-pointer"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label} - {o.sub}
          </option>
        ))}
      </select>
    </label>
  );
}

const Header = () => {
  const role = useAppStore((s) => s.role);
  const setRole = useAppStore((s) => s.setRole);
  const activeEmployeeId = useAppStore((s) => s.activeEmployeeId);
  const setActiveEmployeeId = useAppStore((s) => s.setActiveEmployeeId);
  const activeDriverId = useAppStore((s) => s.activeDriverId);
  const setActiveDriverId = useAppStore((s) => s.setActiveDriverId);

  return (
    <header className="border-b border-line bg-surface/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-350 px-5 py-3 flex items-center justify-between gap-4 flex-wrap">
        <div className="leading-tight">
          <p className="font-extrabold tracking-tight text-[15px] text-signal">
            Waypoint
          </p>
          <p className="text-[11px] text-text-faint font-mono">
            Fleet Dispatch Console
          </p>
        </div>

        <nav className="flex items-center gap-1 rounded-lg bg-ink border border-line p-1 ml-auto sm:ml-4">
          {ROLE_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = role === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setRole(tab.id)}
                className={cx(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
                  active
                    ? "bg-surface-raised text-text shadow-sm"
                    : "text-text-muted hover:text-text",
                )}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto sm:ml-0 min-w-80">
          {role === "employee" && (
            <IdentityPicker
              label="Signed in as"
              value={activeEmployeeId}
              onChange={setActiveEmployeeId}
              options={employees.map((e) => ({
                id: e.id,
                label: e.name,
                sub: e.department,
              }))}
            />
          )}
          {role === "driver" && (
            <IdentityPicker
              label="Signed in as"
              value={activeDriverId}
              onChange={setActiveDriverId}
              options={drivers.map((d) => ({
                id: d.id,
                label: d.name,
                sub: d.license,
              }))}
            />
          )}
          {role === "admin" && (
            <div className="text-xs text-text-faint font-mono pr-1">
              dispatch@waypoint.internal
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

import { TripStatus } from "@/lib/types";
import { cx } from "@/lib/utils";

const STATUS_CONFIG: Record<
  TripStatus,
  { label: string; dot: string; className: string }
> = {
  pending: {
    label: "Awaiting approval",
    dot: "bg-signal",
    className: "bg-signal-soft text-signal border-signal/30",
  },
  approved: {
    label: "Approved",
    dot: "bg-info",
    className: "bg-info-soft text-info border-info/30",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-stop",
    className: "bg-stop-soft text-stop border-stop/30",
  },
  ongoing: {
    label: "On the road",
    dot: "bg-go animate-pulse",
    className: "bg-go-soft text-go border-go/30",
  },
  completed: {
    label: "Completed",
    dot: "bg-text-muted",
    className: "bg-surface-raised text-text-muted border-line",
  },
  cancelled: {
    label: "Cancelled",
    dot: "bg-text-faint",
    className: "bg-surface-raised text-text-faint border-line",
  },
};

const StatusBadge = ({ status }: { status: TripStatus }) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
        cfg.className,
      )}
    >
      <span className={cx("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
};

export default StatusBadge;

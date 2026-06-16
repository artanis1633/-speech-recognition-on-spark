import type { ReactNode } from "react";

interface StatusItemProps {
  icon: ReactNode;
  label: string;
  value: string;
  detail?: string;
  tone?: "green" | "blue" | "muted" | "orange";
}

export function StatusItem({ icon, label, value, detail, tone = "green" }: StatusItemProps) {
  return (
    <div className="status-item">
      <div className={`status-icon ${tone}`}>{icon}</div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail ? <span className="status-detail">{detail}</span> : null}
      </div>
    </div>
  );
}

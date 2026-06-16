import type { ReactNode } from "react";

interface PanelHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PanelHeader({ title, subtitle, action }: PanelHeaderProps) {
  return (
    <div className="section-header">
      <div className="left">
        <h2 className="section-title">{title}</h2>
        {subtitle ? <p className="eyebrow">{subtitle}</p> : null}
      </div>
      {action ? <div className="right">{action}</div> : null}
    </div>
  );
}

import type { ReactNode } from "react";

interface PanelProps {
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export default function Panel({
  title,
  children,
  actions,
  className = "",
}: PanelProps) {
  return (
    <section className={`dashboard-panel ${className}`}>
      <div className="panel-header">
        <h2>{title}</h2>

        {actions}
      </div>

      <div className="panel-content">{children}</div>
    </section>
  );
}
interface MetricCardProps {
  label: string;
  value: string | number;
}

export default function MetricCard({
  label,
  value,
}: MetricCardProps) {
  return (
    <article className="metric-card">
      <span className="metric-label">{label}</span>

      <strong className="metric-value">{value}</strong>
    </article>
  );
}
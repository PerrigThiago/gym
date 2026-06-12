import type { IconType } from "react-icons";

export type DashboardMetric = {
  icon: IconType;
  label: string;
  value: string | number;
};

type DashboardMetricsProps = {
  metrics: DashboardMetric[];
};

export function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  return (
    <section className="metrics-grid" aria-label="Indicadores principales">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <article className="metric-card" key={metric.label}>
            <span>
              <Icon />
            </span>
            <p>{metric.label}</p>
            <strong>{metric.value}</strong>
          </article>
        );
      })}
    </section>
  );
}

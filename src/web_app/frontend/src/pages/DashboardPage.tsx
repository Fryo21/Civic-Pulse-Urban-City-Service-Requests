import { useEffect, useState } from "react";

import CategoryFilter from "../features/dashboard/components/CategoryFilter";
import CrimeCategoryChart from "../features/dashboard/components/CrimeCategoryChart";
import CrimeTrendChart from "../features/dashboard/components/CrimeTrendChart";
import DashboardFilters from "../features/dashboard/components/DashboardFilters";
import MetricCard from "../features/dashboard/components/MetricCard";
import Panel from "../features/dashboard/components/Panel";

import { CATEGORY_NAMES } from "../features/dashboard/constants";
import { getDashboardData } from "../features/dashboard/services/dashboardService";

import type {
  DashboardData,
  DashboardFilters as Filters,
} from "../features/dashboard/types/dashboard";

export default function DashboardPage() {
  const [filters, setFilters] = useState<Filters>({
    policeForce: "Metropolitan Police Service",
    year: 2025,
    month: 2,
  });

  const [data, setData] = useState<DashboardData | null>(null);

  const [hotspotCategory, setHotspotCategory] = useState("all");

  const [trendCategory, setTrendCategory] = useState("all");

  useEffect(() => {
    getDashboardData(filters).then(setData);
  }, [filters]);

  if (!data) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  const trendData = data.monthlyTrend.map((row) => ({
    label: row.label,
    count:
      trendCategory === "all"
        ? CATEGORY_NAMES.reduce(
            (sum, category) => sum + Number(row[category] ?? 0),
            0
          )
        : Number(row[trendCategory] ?? 0),
  }));

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <span className="dashboard-eyebrow">CIVICPULSE</span>

        <div className="data-date">
          <span>Data period</span>

          <strong>
            {filters.year} / {String(filters.month).padStart(2, "0")}
          </strong>
        </div>
      </header>

      <DashboardFilters
        filters={filters}
        onChange={setFilters}
      />

      <section className="metric-grid">
        <MetricCard
          label="Total crimes"
          value={data.summary.totalCrimes.toLocaleString()}
        />

        <MetricCard
          label="Top category"
          value={data.summary.topCategory}
        />

        <MetricCard
          label="Top location"
          value={data.summary.topLocation}
        />

        <MetricCard
          label="Unique streets"
          value={data.summary.uniqueStreets.toLocaleString()}
        />
      </section>

      <section className="dashboard-grid">
        <Panel
          title="Crime hotspots"
          className="map-panel"
          actions={
            <CategoryFilter
              categories={data.categories.map(
                (category) => category.category
              )}
              value={hotspotCategory}
              onChange={setHotspotCategory}
            />
          }
        >
          <div className="map-placeholder">
            <div>
              <span className="map-label">
                LONDON MAP
              </span>

              <h3>
                Geographic Crime Distribution
              </h3>

              <p>
                Azure Maps heatmap and crime-location points
                will render here.
              </p>

              <div className="map-switch">
                <button
                  type="button"
                  className="active"
                >
                  Heatmap
                </button>

                <button type="button">
                  Points
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          title="Top crime locations"
          className="locations-panel"
        >
          <div className="location-list">
            {data.locations.map(
              (location, index) => (
                <div
                  className="location-row"
                  key={location.street}
                >
                  <span className="location-position">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <div>
                    <strong>
                      {location.street}
                    </strong>

                    <span>
                      {location.latitude},{" "}
                      {location.longitude}
                    </span>
                  </div>

                  <strong>
                    {location.count.toLocaleString()}
                  </strong>
                </div>
              )
            )}
          </div>
        </Panel>

        <Panel
          title="Crimes by category"
          className="category-panel"
        >
          <CrimeCategoryChart data={data.categories} />
        </Panel>

        <Panel
          title="Crime trend by month"
          className="distribution-panel"
          actions={
            <CategoryFilter
              categories={CATEGORY_NAMES}
              value={trendCategory}
              onChange={setTrendCategory}
            />
          }
        >
          <CrimeTrendChart data={trendData} />
        </Panel>
      </section>
    </main>
  );
}
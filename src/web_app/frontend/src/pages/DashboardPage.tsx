import { useEffect, useState } from "react";

import CategoryFilter from "../features/dashboard/components/CategoryFilter";
import CrimeCategoryChart from "../features/dashboard/components/CrimeCategoryChart";
import CrimeTrendChart from "../features/dashboard/components/CrimeTrendChart";
import DashboardFilters from "../features/dashboard/components/DashboardFilters";
import MetricCard from "../features/dashboard/components/MetricCard";
import Panel from "../features/dashboard/components/Panel";
import CrimeMap from "../features/dashboard/components/CrimeMap";

import {
  getCrimeHotspots,
  getCrimeMetadata,
  getDashboardData,
} from "../features/dashboard/services/dashboardService";

import type {
  CrimeLocation,
  CrimeMetadata,
  DashboardData,
  DashboardFilters as Filters,
} from "../features/dashboard/types/dashboard";

export default function DashboardPage() {
  const [metadata, setMetadata] = useState<CrimeMetadata | null>(null);

  const [filters, setFilters] = useState<Filters | null>(null);

  const [data, setData] = useState<DashboardData | null>(null);

  const [hotspots, setHotspots] = useState<CrimeLocation[]>([]);

  const [hotspotCategory, setHotspotCategory] = useState("all");

  const [focusedLocation, setFocusedLocation] = useState<CrimeLocation | null>(
    null
  );

  const [mapMode, setMapMode] = useState<"heatmap" | "points">("heatmap");

  const [trendCategory, setTrendCategory] = useState("all");

  // Discover what data actually exists in the database, then open on the
  // most recent period available rather than any hardcoded default.
  useEffect(() => {
    getCrimeMetadata().then((result) => {
      setMetadata(result);

      if (result.latest) {
        setFilters({
          policeForce: "Metropolitan Police Service",
          year: result.latest.year,
          month: result.latest.month,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!filters) {
      return;
    }

    getDashboardData(filters).then(setData);
  }, [filters]);

  // Kept separate from the dashboard fetch so changing the hotspot category
  // only refreshes the map, not the whole dashboard.
  useEffect(() => {
    if (!filters) {
      return;
    }

    getCrimeHotspots({
      year: filters.year,
      month: filters.month,
      category: hotspotCategory,
    }).then(setHotspots);
  }, [filters, hotspotCategory]);

  if (!metadata || !filters) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  // Rebind to non-null locals: `filters`/`metadata` stay optional in state
  // (TS can't carry that narrowing into the closure below), but by this
  // point the early return above guarantees both are set.
  const activeFilters: Filters = filters;
  const activeMetadata: CrimeMetadata = metadata;

  const monthsForYear = activeMetadata.monthsByYear[activeFilters.year] ?? [];

  function updateFilters(nextFilters: Filters) {
    if (nextFilters.year === activeFilters.year) {
      setFilters(nextFilters);
      return;
    }

    // The year changed — snap the month to a valid one for that year
    // instead of carrying over a month that may not exist there.
    const monthsForNextYear =
      activeMetadata.monthsByYear[nextFilters.year] ?? [];
    const stillValid = monthsForNextYear.includes(nextFilters.month);

    setFilters({
      ...nextFilters,
      month: stillValid
        ? nextFilters.month
        : monthsForNextYear[monthsForNextYear.length - 1],
    });
  }

  if (!data) {
    return <div className="loading-state">Loading dashboard...</div>;
  }

  const trendData = data.monthlyTrend.map((row) => ({
    label: row.label,
    count:
      trendCategory === "all"
        ? metadata.categories.reduce(
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
        years={metadata.years}
        monthsForYear={monthsForYear}
        onChange={updateFilters}
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
              categories={metadata.categories}
              value={hotspotCategory}
              onChange={setHotspotCategory}
            />
          }
        >
            <CrimeMap
                locations={hotspots}
                mapMode={mapMode}
                category={hotspotCategory}
                focusLocation={focusedLocation}
            />
            <div className="map-switch">
                <button
                    type="button"
                    className={mapMode === "heatmap" ? "active" : ""}
                    onClick={() => setMapMode("heatmap")}
                >
                    Heatmap
                </button>

                <button
                    type="button"
                    className={mapMode === "points" ? "active" : ""}
                    onClick={() => setMapMode("points")}
                >
                    Points
                </button>
                </div>
        </Panel>

        <Panel
          title="Top crime locations"
          className="locations-panel"
        >
          <div className="location-list">
            {data.locations.map(
              (location, index) => (
                <button
                  type="button"
                  className="location-row"
                  key={location.street}
                  onClick={() => setFocusedLocation(location)}
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
                </button>
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
              categories={metadata.categories}
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

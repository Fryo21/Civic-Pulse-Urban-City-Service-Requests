import SearchableSelect from "../../../components/SearchableSelect";
import { MONTHS, YEARS } from "../constants";
import type { DashboardFilters as Filters } from "../types/dashboard";

interface DashboardFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export default function DashboardFilters({
  filters,
  onChange,
}: DashboardFiltersProps) {
  return (
    <section className="dashboard-filters">
      <div className="dashboard-filters-title">
        <span>DASHBOARD</span>
        <h2>Crime Intelligence</h2>
      </div>

      <div className="dashboard-filters-controls">
        <label>
          Police Force

          <select
            value={filters.policeForce}
            onChange={(event) =>
              onChange({
                ...filters,
                policeForce: event.target.value,
              })
            }
          >
            <option value="Metropolitan Police Service">
              Metropolitan Police Service
            </option>
          </select>
        </label>

        <label>
          Year

          <select
            value={filters.year}
            onChange={(event) =>
              onChange({
                ...filters,
                year: Number(event.target.value),
              })
            }
          >
            {YEARS.map((year) => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </select>
        </label>

        <label>
          Month

          <SearchableSelect
            options={MONTHS.map((month) => ({
              value: String(month.value),
              label: month.label,
            }))}
            value={String(filters.month)}
            placeholder="Search month..."
            onChange={(value) =>
              onChange({
                ...filters,
                month: Number(value),
              })
            }
          />
        </label>
      </div>
    </section>
  );
}
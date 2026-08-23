import type { DashboardFilters, DashboardData } from "../types/dashboard";
import { generateDashboardMock } from "../mock/dashboardMock";

export async function getDashboardData(
  filters: DashboardFilters
): Promise<DashboardData> {
  return generateDashboardMock(filters);
}

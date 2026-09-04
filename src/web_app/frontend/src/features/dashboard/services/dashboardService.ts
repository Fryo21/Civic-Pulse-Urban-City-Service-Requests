import type {
  CrimeLocation,
  CrimeMetadata,
  DashboardData,
  DashboardFilters,
} from "../types/dashboard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`Request to ${path} failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function getCrimeMetadata(): Promise<CrimeMetadata> {
  return getJson<CrimeMetadata>("/api/crime/metadata");
}

export async function getDashboardData(
  filters: DashboardFilters
): Promise<DashboardData> {
  const params = new URLSearchParams({
    year: String(filters.year),
    month: String(filters.month),
  });

  return getJson<DashboardData>(`/api/crime/dashboard?${params}`);
}

interface HotspotFilters {
  year: number;
  month: number;
  category: string;
}

export async function getCrimeHotspots(
  filters: HotspotFilters
): Promise<CrimeLocation[]> {
  const params = new URLSearchParams({
    year: String(filters.year),
    month: String(filters.month),
    category: filters.category,
  });

  return getJson<CrimeLocation[]>(`/api/crime/hotspots?${params}`);
}

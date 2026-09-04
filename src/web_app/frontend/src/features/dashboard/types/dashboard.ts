export interface DashboardFilters {
  policeForce: string;
  year: number;
  month: number;
}

export interface DashboardSummary {
  totalCrimes: number;
  topCategory: string;
  topLocation: string;
  uniqueStreets: number;
}

export interface CrimeCategory {
  category: string;
  count: number;
}

export interface CrimeLocation {
  street: string;
  latitude: number;
  longitude: number;
  count: number;
}

export interface CategoryMonthlyTrend {
  month: number;
  label: string;
  /** Crime count for that month, keyed by category name. */
  [category: string]: number | string;
}

export interface DashboardData {
  summary: DashboardSummary;
  categories: CrimeCategory[];
  locations: CrimeLocation[];
  monthlyTrend: CategoryMonthlyTrend[];
}

export interface CrimeMetadata {
  years: number[];
  monthsByYear: Record<number, number[]>;
  categories: string[];
  latest: { year: number; month: number } | null;
}
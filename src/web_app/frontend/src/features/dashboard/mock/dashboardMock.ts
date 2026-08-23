import { CATEGORY_NAMES, MONTHS } from "../constants";
import type {
  CategoryMonthlyTrend,
  CrimeCategory,
  CrimeLocation,
  DashboardData,
  DashboardFilters,
} from "../types/dashboard";

const STREETS: Array<Pick<CrimeLocation, "street" | "latitude" | "longitude">> = [
  { street: "High Street", latitude: 51.5074, longitude: -0.1278 },
  { street: "Station Road", latitude: 51.515, longitude: -0.12 },
  { street: "Church Road", latitude: 51.5, longitude: -0.14 },
];

/** Deterministic PRNG (mulberry32) so a given filter combination always
 * produces the same numbers, while different filters produce different ones. */
function mulberry32(seed: number) {
  let state = seed;

  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(...parts: number[]): number {
  return parts.reduce((seed, part) => (seed * 2654435761 + part) >>> 0, 0);
}

function randomInRange(random: () => number, min: number, max: number): number {
  return Math.round(min + random() * (max - min));
}

function generateCategories(year: number, month: number): CrimeCategory[] {
  return CATEGORY_NAMES.map((category, index) => {
    const random = mulberry32(seedFrom(year, month, index, 1));

    return {
      category,
      count: Math.max(
        50,
        randomInRange(random, 900, 4600) - index * 350
      ),
    };
  }).sort((a, b) => b.count - a.count);
}

function generateLocations(year: number, month: number): CrimeLocation[] {
  return STREETS.map((location, index) => {
    const random = mulberry32(seedFrom(year, month, index, 2));

    return {
      ...location,
      count: Math.max(10, randomInRange(random, 70, 210) - index * 25),
    };
  }).sort((a, b) => b.count - a.count);
}

function generateMonthlyTrend(year: number): CategoryMonthlyTrend[] {
  return MONTHS.map((monthOption) => {
    const categoriesForMonth = generateCategories(year, monthOption.value);

    const row: CategoryMonthlyTrend = {
      month: monthOption.value,
      label: monthOption.label.slice(0, 3),
    };

    for (const entry of categoriesForMonth) {
      row[entry.category] = entry.count;
    }

    return row;
  });
}

export function generateDashboardMock(
  filters: DashboardFilters
): DashboardData {
  const { year, month } = filters;

  const categories = generateCategories(year, month);
  const locations = generateLocations(year, month);
  const monthlyTrend = generateMonthlyTrend(year);

  const totalCrimes = categories.reduce((sum, entry) => sum + entry.count, 0);
  const uniqueStreetsRandom = mulberry32(seedFrom(year, month, 4));

  return {
    summary: {
      totalCrimes,
      topCategory: categories[0].category,
      topLocation: locations[0].street,
      uniqueStreets: randomInRange(uniqueStreetsRandom, 1800, 3200),
    },
    categories,
    locations,
    monthlyTrend,
  };
}

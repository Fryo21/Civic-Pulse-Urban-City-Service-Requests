import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { CrimeCategory } from "../types/dashboard";

interface CrimeCategoryChartProps {
  data: CrimeCategory[];
}

export default function CrimeCategoryChart({
  data,
}: CrimeCategoryChartProps) {
  return (
    <div className="crime-category-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          barCategoryGap="20%"
          margin={{
            top: 10,
            right: 20,
            bottom: 10,
            left: 10,
          }}
        >
          <CartesianGrid
            stroke="#1d2b3d"
            strokeDasharray="3 3"
            horizontal={false}
          />

          <XAxis
            type="number"
            tick={{
              fill: "#74849a",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            type="category"
            dataKey="category"
            width={130}
            tick={{
              fill: "#cbd5e1",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />

          <Tooltip
            cursor={{
              fill: "rgba(78, 161, 255, 0.05)",
            }}
            contentStyle={{
              background: "#101d2e",
              border: "1px solid #2a3c53",
              borderRadius: "6px",
              color: "#ffffff",
            }}
            labelStyle={{
              color: "#ffffff",
            }}
            formatter={(value) => [
              Number(value).toLocaleString(),
              "Crimes",
            ]}
          />

          <Bar
            dataKey="count"
            fill="#2f8df4"
            radius={[0, 4, 4, 0]}
            maxBarSize={26}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
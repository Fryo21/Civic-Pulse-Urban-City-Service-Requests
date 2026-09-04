import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrendPoint {
  label: string;
  count: number;
}

interface CrimeTrendChartProps {
  data: TrendPoint[];
}

export default function CrimeTrendChart({ data }: CrimeTrendChartProps) {
  return (
    <div className="crime-trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 15,
            bottom: 0,
            left: 0,
          }}
        >
          <defs>
            <linearGradient
              id="crimeTrendFill"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#2f8df4"
                stopOpacity={0.35}
              />
              <stop
                offset="100%"
                stopColor="#2f8df4"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>

          <CartesianGrid
            stroke="#1d2b3d"
            strokeDasharray="3 3"
            vertical={false}
          />

          <XAxis
            dataKey="label"
            tick={{
              fill: "#74849a",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
          />

          <YAxis
            tick={{
              fill: "#74849a",
              fontSize: 11,
            }}
            axisLine={false}
            tickLine={false}
            width={42}
          />

          <Tooltip
            cursor={{
              stroke: "#2a3c53",
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

          <Area
            type="monotone"
            dataKey="count"
            stroke="#2f8df4"
            strokeWidth={2}
            fill="url(#crimeTrendFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

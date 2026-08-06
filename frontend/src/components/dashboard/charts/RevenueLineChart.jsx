import { memo, useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';
import { useChartTheme } from './chartTheme';

const formatCurrency = (value) =>
  value != null && !Number.isNaN(Number(value))
    ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—';

/**
 * RevenueLineChart – 12-month revenue trend. A single-line area chart whose
 * emerald stroke matches the `revenue` tone already used on the dashboard stat
 * cards, so the chart reads as the visual extension of the "Today's Revenue"
 * tile. The y-axis is currency-formatted; the x-axis shows the short month
 * label. `useMemo` keeps the series stable across theme-only re-renders so the
 * Recharts subtree doesn't repaint when the user toggles dark mode.
 *
 * @param {object} props
 * @param {Array<{monthKey:string,label:string,revenue:number}>} props.data
 * @param {boolean} [props.isLoading=false]
 */
const RevenueLineChart = ({ data = [], isLoading = false }) => {
  const theme = useChartTheme();

  const series = useMemo(() => data, [data]);
  const isEmpty = !isLoading && series.every((point) => Number(point.revenue) <= 0);

  return (
    <ChartCard
      title="Monthly Revenue"
      subtitle="Last 12 months · realised revenue"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No paid orders in the last 12 months — revenue will appear here."
    >
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={series} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: theme.axisStroke, fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: theme.gridStroke }}
            minTickGap={16}
          />
          <YAxis
            tick={{ fill: theme.axisStroke, fontSize: 12 }}
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={{ stroke: theme.gridStroke }}
            width={72}
          />
          <Tooltip
            contentStyle={theme.tooltipStyle}
            formatter={(value) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => `Month: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke="#10b981"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#0f172a' }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

RevenueLineChart.displayName = 'RevenueLineChart';

export default memo(RevenueLineChart);

import { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';
import { CHART_COLORS, useChartTheme } from './chartTheme';

const formatCurrency = (value) =>
  value != null && !Number.isNaN(Number(value))
    ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
    : '—';

/**
 * TopCategoriesChart – top 5 product categories by revenue across non-cancelled
 * orders. Uses the same horizontal-bar pattern as `TopProductsChart` for visual
 * consistency; categories sit on the y-axis so long names don't get rotated.
 *
 * @param {object} props
 * @param {Array<{category:string,revenue:number,unitsSold:number,orders:number}>} props.data
 * @param {boolean} [props.isLoading=false]
 */
const TopCategoriesChart = ({ data = [], isLoading = false }) => {
  const theme = useChartTheme();

  const series = useMemo(() => data, [data]);
  const isEmpty = !isLoading && series.length === 0;

  return (
    <ChartCard
      title="Top Categories"
      subtitle="Top 5 by revenue"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No category revenue yet."
    >
      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={series}
          layout="vertical"
          margin={{ top: 8, right: 16, bottom: 8, left: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: theme.axisStroke, fontSize: 11 }}
            tickFormatter={formatCurrency}
            tickLine={false}
            axisLine={{ stroke: theme.gridStroke }}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fill: theme.axisStroke, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.gridStroke }}
            width={120}
          />
          <Tooltip
            contentStyle={theme.tooltipStyle}
            formatter={(value) => [formatCurrency(value), 'Revenue']}
            labelFormatter={(label) => `Category: ${label}`}
          />
          <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {series.map((entry, index) => (
              <Cell key={entry.category} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

TopCategoriesChart.displayName = 'TopCategoriesChart';

export default memo(TopCategoriesChart);

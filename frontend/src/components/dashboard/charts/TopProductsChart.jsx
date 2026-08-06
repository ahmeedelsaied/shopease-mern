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

/**
 * TopProductsChart – top 5 products by total units sold across non-cancelled
 * orders, as a horizontal bar chart so the product names fit on the y-axis
 * without rotation. Each bar gets a deterministic colour from `CHART_COLORS`
 * for slice distinction. Memoised on `data` so theme flips don't repaint.
 *
 * @param {object} props
 * @param {Array<{productId:string,name:string,unitsSold:number,revenue:number}>} props.data
 * @param {boolean} [props.isLoading=false]
 */
const MAX_NAME_LENGTH = 22;

const truncate = (name) =>
  name && name.length > MAX_NAME_LENGTH
    ? `${name.slice(0, MAX_NAME_LENGTH - 1)}…`
    : name;

const TopProductsChart = ({ data = [], isLoading = false }) => {
  const theme = useChartTheme();

  const series = useMemo(
    () =>
      data.map((row) => ({
        productId: row.productId,
        // Keep the full name on the row so the tooltip can show it; the y-axis
        // uses the truncated label via `yAxisTickFormatter` so long names don't
        // push the chart off the panel.
        name: row.name,
        unitsSold: row.unitsSold,
        revenue: row.revenue,
      })),
    [data]
  );
  const isEmpty = !isLoading && series.length === 0;

  const yAxisTickFormatter = (name) => truncate(name);

  return (
    <ChartCard
      title="Top Products"
      subtitle="Top 5 by units sold"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No products have sold yet."
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
            allowDecimals={false}
            tick={{ fill: theme.axisStroke, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.gridStroke }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tickFormatter={yAxisTickFormatter}
            tick={{ fill: theme.axisStroke, fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: theme.gridStroke }}
            width={150}
          />
          <Tooltip
            contentStyle={theme.tooltipStyle}
            formatter={(value, _name, payload) => [
              `${Number(value).toLocaleString()} units`,
              payload?.payload?.name ?? 'Product',
            ]}
          />
          <Bar dataKey="unitsSold" name="Units Sold" radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {series.map((entry, index) => (
              <Cell key={entry.productId} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

TopProductsChart.displayName = 'TopProductsChart';

export default memo(TopProductsChart);

import { memo, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import ChartCard from './ChartCard';
import { useChartTheme } from './chartTheme';

/**
 * OrdersBarChart – monthly (12 months) and weekly (last 7 days) order counts
 * rendered as two stacked bar charts inside a single ChartCard so the admin
 * sees volume trends at two time horizons without a stateful toggle. Both bars
 * use the secondary blue (`#2563eb`) so the panels visually unify. Memoised so
 * parent re-renders (e.g. theme flip) don't repaint the bars.
 *
 * @param {object} props
 * @param {Array<{monthKey:string,label:string,orders:number}>} props.monthlyData
 * @param {Array<{date:string,weekday:string,orders:number}>}   props.weeklyData
 * @param {boolean} [props.isLoading=false]
 */
const OrdersBarChart = ({ monthlyData = [], weeklyData = [], isLoading = false }) => {
  const theme = useChartTheme();

  const monthlySeries = useMemo(() => monthlyData, [monthlyData]);
  const weeklySeries = useMemo(() => weeklyData, [weeklyData]);

  const monthlyEmpty = !isLoading && monthlySeries.every((p) => Number(p.orders) <= 0);
  const weeklyEmpty = !isLoading && weeklySeries.every((p) => Number(p.orders) <= 0);
  const isEmpty = monthlyEmpty && weeklyEmpty;

  return (
    <ChartCard
      title="Monthly & Weekly Orders"
      subtitle="12-month trend and last 7 days"
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No orders placed yet — order volume will appear here."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            Last 12 months
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fill: theme.axisStroke, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: theme.gridStroke }}
                minTickGap={12}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: theme.axisStroke, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: theme.gridStroke }}
                width={32}
              />
              <Tooltip
                contentStyle={theme.tooltipStyle}
                formatter={(value) => [Number(value).toLocaleString(), 'Orders']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar dataKey="orders" name="Orders" fill="#2563eb" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="mb-2 text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
            Last 7 days
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklySeries} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={theme.gridStroke} vertical={false} />
              <XAxis
                dataKey="weekday"
                tick={{ fill: theme.axisStroke, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: theme.gridStroke }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: theme.axisStroke, fontSize: 11 }}
                tickLine={false}
                axisLine={{ stroke: theme.gridStroke }}
                width={32}
              />
              <Tooltip
                contentStyle={theme.tooltipStyle}
                formatter={(value) => [Number(value).toLocaleString(), 'Orders']}
                labelFormatter={(label) => `Day: ${label}`}
              />
              <Bar dataKey="orders" name="Orders" fill="#8b5cf6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ChartCard>
  );
};

OrdersBarChart.displayName = 'OrdersBarChart';

export default memo(OrdersBarChart);

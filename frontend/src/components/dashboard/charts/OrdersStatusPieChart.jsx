import { memo, useMemo } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartCard from './ChartCard';
import { STATUS_COLOR, statusLabel, useChartTheme } from './chartTheme';

/**
 * OrdersStatusPieChart – breakdown of all orders by their current lifecycle
 * status, rendered as a donut. Every canonical order status appears even when
 * its count is zero (the backend merges against `ORDER_STATUSES`), so the
 * legend is stable across reloads. Slice colours come from `STATUS_COLOR` —
 * the same palette used by the order-status badges on the existing dashboard
 * — so a glance at the pie and the Latest Orders badges tell the same story.
 *
 * @param {object} props
 * @param {Array<{status:string,count:number}>} props.data
 * @param {boolean} [props.isLoading=false]
 */
const renderStatusLegend = (payload) =>
  payload.map((entry) => (
    <li key={entry.value} className="flex items-center gap-2 text-sm text-on-surface-variant">
      <span
        aria-hidden="true"
        className="inline-block h-3 w-3 rounded-full"
        style={{ backgroundColor: entry.color }}
      />
      <span>{statusLabel(entry.value)}</span>
      <span className="font-semibold text-on-surface">{entry.payload.count}</span>
    </li>
  ));

const renderTooltipContent = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div>
      <p className="font-semibold">{statusLabel(point.status)}</p>
      <p className="text-sm">{point.count.toLocaleString()} orders</p>
    </div>
  );
};

const OrdersStatusPieChart = ({ data = [], isLoading = false }) => {
  const theme = useChartTheme();

  const series = useMemo(
    () => data.filter((row) => Number(row.count) > 0),
    [data]
  );
  const total = useMemo(
    () => data.reduce((sum, row) => sum + (Number(row.count) || 0), 0),
    [data]
  );
  const isEmpty = !isLoading && total === 0;

  return (
    <ChartCard
      title="Orders by Status"
      subtitle={`${total.toLocaleString()} order${total === 1 ? '' : 's'} in total`}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyMessage="No orders have been placed yet."
    >
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={series}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={series.length > 1 ? 2 : 0}
            stroke={theme.surfaceStroke}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {series.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLOR[entry.status] ?? '#94a3b8'} />
            ))}
          </Pie>
          <Tooltip content={renderTooltipContent} wrapperStyle={theme.tooltipStyle} />
          <Legend
            verticalAlign="bottom"
            align="center"
            content={({ payload }) => (
              <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-2">
                {renderStatusLegend(payload ?? [])}
              </ul>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};

OrdersStatusPieChart.displayName = 'OrdersStatusPieChart';

export default memo(OrdersStatusPieChart);

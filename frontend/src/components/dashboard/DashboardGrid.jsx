import { memo } from 'react';
import { cn } from '../../styles/designSystem';

/**
 * DashboardGrid – responsive grid wrapper for a row of stat cards. Defaults to
 * the exact column counts the existing AdminDashboard uses
 * (`md:grid-cols-2 xl:grid-cols-4`) so swapping the inline grid for this
 * component changes nothing visually. `columns` lets a specific section pick a
 * narrower layout (e.g. a 3-up "today" row) without dropping the shared grid
 * chassis.
 *
 * @param {object}    props
 * @param {React.ReactNode} props.children - Stat cards / tiles to lay out.
 * @param {"2"|"3"|"4"} [props.columns="4"] - Max column count at `xl`.
 * @param {string}   [props.className]
 */
const XL_COLUMN_CLASS = {
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
};

const DashboardGrid = ({ children, columns = '4', className = '' }) => (
  <div
    className={cn(
      'grid gap-4 md:grid-cols-2',
      XL_COLUMN_CLASS[columns] ?? XL_COLUMN_CLASS['4'],
      className
    )}
  >
    {children}
  </div>
);

DashboardGrid.displayName = 'DashboardGrid';

export default memo(DashboardGrid);

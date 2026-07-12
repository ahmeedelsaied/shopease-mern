/**
 * ProductResultsBar – shows "Showing X–Y of Z products" and the current page.
 *
 * `pageSize` is the number of items per page (used for range math).
 * `total` is the grand total across all pages.
 */
const ProductResultsBar = ({ currentPage, totalPages, pageSize, total }) => {
  if (!total) return null;

  const rangeStart = (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(rangeStart + pageSize - 1, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-low p-4">
      <div className="space-y-1">
        <p className="text-label-sm font-label-sm uppercase tracking-[0.24em] text-on-surface-variant">
          Results
        </p>
        <p className="text-body-md text-on-surface-variant">
          Page {currentPage} of {totalPages}
        </p>
      </div>
      <p className="text-body-md text-on-surface-variant">
        Showing {rangeStart}–{rangeEnd} of {total} products
      </p>
    </div>
  );
};

export default ProductResultsBar;

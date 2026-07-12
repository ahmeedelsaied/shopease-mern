import Button from './ui/Button';
import { cn } from '../styles/designSystem';

const getPageWindow = (currentPage, totalPages) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push('...');
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push('...');
  }

  pages.push(totalPages);
  return pages;
};

const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  const pages = getPageWindow(currentPage, totalPages);

  return (
    <nav
      className={cn(
        'flex flex-col gap-4 rounded-[1.5rem] border border-outline-variant/30 bg-surface-container-lowest px-4 py-4 shadow-soft sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      aria-label="Product pagination"
    >
      <p className="text-body-md text-on-surface-variant">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
          aria-label="First page"
        >
          <span className="material-symbols-outlined text-[18px]">first_page</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="Previous page"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_left</span>
        </Button>

        {pages.map((page, index) =>
          page === '...' ? (
            <span
              key={`ellipsis-${index}`}
              className="inline-flex h-10 min-w-10 items-center justify-center px-2 text-body-md text-on-surface-variant"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              variant={page === currentPage ? 'primary' : 'secondary'}
              size="sm"
              className="min-w-10 px-3"
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </Button>
          )
        )}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="Next page"
        >
          <span className="material-symbols-outlined text-[18px]">chevron_right</span>
        </Button>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
          aria-label="Last page"
        >
          <span className="material-symbols-outlined text-[18px]">last_page</span>
        </Button>
      </div>
    </nav>
  );
};

export default Pagination;

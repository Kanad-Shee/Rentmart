import { ChevronLeft, ChevronRight } from "lucide-react";

type CategoryPaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export function CategoryPagination({
  currentPage,
  totalPages,
  onPageChange,
}: CategoryPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);

  return (
    <div className="flex items-center justify-center gap-2 py-6">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="inline-flex h-10 w-10 items-center justify-center border border-[#dfe4eb] bg-white text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={[
            "inline-flex h-10 min-w-10 items-center justify-center border px-3 text-sm transition-colors",
            page === currentPage
              ? "border-primary bg-primary text-primary-foreground"
              : "border-[#dfe4eb] bg-white text-[#5d6f8f] hover:bg-muted",
          ].join(" ")}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="inline-flex h-10 w-10 items-center justify-center border border-[#dfe4eb] bg-white text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

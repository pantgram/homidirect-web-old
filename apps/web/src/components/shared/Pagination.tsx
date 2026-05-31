import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  maxVisible?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  maxVisible = 5,
}: PaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  const startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const endPage = Math.min(totalPages, startPage + maxVisible - 1);
  const adjustedStart = Math.max(1, endPage - maxVisible + 1);

  const pages = [];
  for (let i = adjustedStart; i <= endPage; i++) {
    pages.push(i);
  }

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        disabled={!hasPreviousPage}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        {t("search.previous")}
      </Button>
      {pages.map((pageNum) => (
        <Button
          key={pageNum}
          variant={currentPage === pageNum ? "default" : "outline"}
          onClick={() => handlePageChange(pageNum)}
        >
          {pageNum}
        </Button>
      ))}
      <Button
        variant="outline"
        disabled={!hasNextPage}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        {t("search.next")}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}

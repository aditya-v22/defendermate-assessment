import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between py-3 text-xs text-muted-foreground">
      <span>
        Page <span className="font-mono text-foreground">{page}</span> of{' '}
        <span className="font-mono text-foreground">{totalPages}</span>
      </span>
      <div className="flex gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1 border-border"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-3 w-3" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1 border-border"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

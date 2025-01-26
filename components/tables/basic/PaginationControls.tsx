import { Button } from "@/components/ui/button";

interface PaginationControlsProps {
  table: any;
  pageIndex: number;
  pageCount: number;
  setPageIndex: (pageIndex: number) => void;
  setPageSize: (pageSize: number) => void;
  pageSizeOptions: number[];
}

export function PaginationControls({
  table,
  pageIndex,
  pageCount,
  setPageIndex,
  setPageSize,
  pageSizeOptions,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0 md:space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="whitespace-nowrap text-sm font-medium">Rows per page</p>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          className="text-sm"
        >
          {pageSizeOptions.map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.setPageIndex(0);
            setPageIndex(0);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.previousPage();
            setPageIndex(pageIndex - 1);
          }}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {pageIndex + 1} of {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.nextPage();
            setPageIndex(pageIndex + 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            table.setPageIndex(pageCount - 1);
            setPageIndex(pageCount - 1);
          }}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </Button>
      </div>
    </div>
  );
}

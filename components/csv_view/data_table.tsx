"use client";

import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import * as XLSX from "xlsx";
import Papa from "papaparse";

interface DataTableProps {
  data: Record<string, any>[];
  columns?: string[];
  title?: string;
  subtitle?: string;
  extraActions?: React.ReactNode;
  exportFileName?: string;
}

export default function DataTable({
  data,
  columns: propColumns,
  title,
  subtitle,
  extraActions,
  exportFileName = "data",
}: DataTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pageSize, setPageSize] = useState(50);

  // Derive column list
  const cols = useMemo(() => {
    if (propColumns && propColumns.length > 0) return propColumns;
    if (data.length > 0) return Object.keys(data[0]);
    return [];
  }, [propColumns, data]);

  // Construct TanStack table columns
  const columnDefs = useMemo(() => {
    const helper = createColumnHelper<Record<string, any>>();
    return cols.map((col) =>
      helper.accessor((row) => row[col], {
        id: col,
        header: col,
        cell: (info) => {
          const val = info.getValue();
          if (val === null || val === undefined) {
            return <span className="text-gray-400 italic font-mono text-xs">null</span>;
          }
          if (typeof val === "boolean") {
            return (
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono ${val ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {val ? "true" : "false"}
              </span>
            );
          }
          return <span className="font-mono text-xs text-gray-900">{String(val)}</span>;
        },
      })
    );
  }, [cols]);

  const table = useReactTable({
    data,
    columns: columnDefs,
    state: {
      sorting,
      globalFilter,
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize,
      },
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Export handlers
  const exportToExcel = () => {
    if (!data.length) return;
    const exportRows = table.getFilteredRowModel().rows.map(r => r.original);
    const ws = XLSX.utils.json_to_sheet(exportRows.length > 0 ? exportRows : data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, `${exportFileName}.xlsx`);
  };

  const exportToCSV = () => {
    if (!data.length) return;
    const exportRows = table.getFilteredRowModel().rows.map(r => r.original);
    const csv = Papa.unparse(exportRows.length > 0 ? exportRows : data);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFileName}.csv`;
    link.click();
  };

  const exportToJSON = () => {
    if (!data.length) return;
    const exportRows = table.getFilteredRowModel().rows.map(r => r.original);
    const json = JSON.stringify(exportRows.length > 0 ? exportRows : data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFileName}.json`;
    link.click();
  };

  const hasActiveFilters = columnFilters.length > 0 || globalFilter !== "";

  if (!data || data.length === 0) {
    return (
      <div className="border border-black bg-white p-12 text-center text-gray-500">
        <p className="text-base font-medium">No records found</p>
        <p className="text-xs text-gray-400 mt-1">The table or query returned 0 rows.</p>
      </div>
    );
  }

  return (
    <div className="border border-black bg-white flex flex-col flex-1 shadow-sm">
      {/* Table Toolbar */}
      <div className="p-3 border-b border-black bg-gray-50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {title && (
            <div>
              <h3 className="font-bold text-sm text-black flex items-center gap-2">
                <span>{title}</span>
                <span className="text-xs font-normal text-gray-500">
                  ({table.getFilteredRowModel().rows.length.toLocaleString()}{hasActiveFilters ? ` of ${data.length.toLocaleString()}` : ""} rows • {cols.length} cols)
                </span>
              </h3>
              {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
          )}

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search table..."
              className="border border-black px-3 py-1.5 text-xs bg-white focus:outline-none min-w-[180px]"
            />
            {globalFilter && (
              <button
                onClick={() => setGlobalFilter("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Toggle Column Filters */}
          <button
            onClick={() => setShowColumnFilters(!showColumnFilters)}
            className={`px-2.5 py-1.5 border border-black text-xs font-medium transition-colors flex items-center gap-1.5 ${
              showColumnFilters || columnFilters.length > 0
                ? "bg-black text-white"
                : "bg-white text-black hover:bg-gray-100"
            }`}
            title="Toggle per-column filters"
          >
            <span>🔍 Column Filters</span>
            {columnFilters.length > 0 && (
              <span className="bg-blue-600 text-white rounded-full px-1.5 py-0.2 text-[10px] font-bold">
                {columnFilters.length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={() => {
                setColumnFilters([]);
                setGlobalFilter("");
              }}
              className="px-2.5 py-1.5 border border-red-500 bg-red-50 text-red-700 hover:bg-red-100 text-xs font-medium transition-colors"
              title="Reset all search filters"
            >
              Clear Filters ✕
            </button>
          )}

          {/* Rows per page */}
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              setPageSize(newSize);
              table.setPageSize(newSize);
            }}
            className="border border-black bg-white px-2 py-1.5 text-xs focus:outline-none"
          >
            <option value={25}>25 rows</option>
            <option value={50}>50 rows</option>
            <option value={100}>100 rows</option>
            <option value={200}>200 rows</option>
          </select>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {extraActions}

          <div className="flex items-center gap-1 border border-black bg-white p-0.5">
            <span className="text-[11px] font-semibold px-2 text-gray-500 uppercase tracking-wider">
              Export:
            </span>
            <button
              onClick={exportToExcel}
              className="px-2 py-1 text-xs hover:bg-black hover:text-white transition-colors"
              title="Export as Excel .xlsx"
            >
              Excel
            </button>
            <button
              onClick={exportToCSV}
              className="px-2 py-1 text-xs hover:bg-black hover:text-white transition-colors"
              title="Export as CSV"
            >
              CSV
            </button>
            <button
              onClick={exportToJSON}
              className="px-2 py-1 text-xs hover:bg-black hover:text-white transition-colors"
              title="Export as JSON"
            >
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Main Table Grid */}
      <div className="overflow-x-auto overflow-y-auto flex-1 max-h-[650px] relative">
        <table className="min-w-full text-left border-collapse table-auto">
          <thead className="bg-gray-100 sticky top-0 z-10 border-b border-black">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <th className="px-3 py-2 text-[11px] font-mono text-gray-500 uppercase border-r border-gray-300 w-12 text-center bg-gray-100">
                  #
                </th>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="px-3 py-2.5 text-xs font-semibold text-black border-r border-gray-300 select-none cursor-pointer hover:bg-gray-200 transition-colors whitespace-nowrap"
                  >
                    <div className="flex items-center gap-1">
                      <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                      <span className="text-[10px] text-gray-500">
                        {header.column.getIsSorted() === "asc"
                          ? "▲"
                          : header.column.getIsSorted() === "desc"
                          ? "▼"
                          : ""}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            ))}

            {/* Column-Specific Filter Row */}
            {showColumnFilters && (
              <tr className="bg-gray-50 border-b border-gray-300">
                <th className="p-1 border-r border-gray-300 text-center text-gray-400 text-xs">
                  🔍
                </th>
                {cols.map((col) => {
                  const filterValue = (table.getColumn(col)?.getFilterValue() as string) ?? "";
                  return (
                    <th key={col} className="p-1 border-r border-gray-300 font-normal">
                      <input
                        type="text"
                        value={filterValue}
                        onChange={(e) => table.getColumn(col)?.setFilterValue(e.target.value)}
                        placeholder={`Filter ${col}...`}
                        className="w-full border border-gray-300 px-2 py-1 text-[11px] font-mono font-normal bg-white focus:outline-none focus:border-black"
                      />
                    </th>
                  );
                })}
              </tr>
            )}
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows.map((row, idx) => (
              <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-3 py-1.5 text-[11px] font-mono text-gray-400 text-center border-r border-gray-200 select-none bg-gray-50/40">
                  {table.getState().pagination.pageIndex * pageSize + idx + 1}
                </td>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-1.5 text-xs border-r border-gray-200 max-w-sm truncate whitespace-nowrap"
                    title={String(cell.getValue() ?? "")}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}

            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={cols.length + 1} className="py-8 text-center text-xs text-gray-500">
                  No records match the applied filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-black bg-gray-50 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2.5 py-1 border border-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            « First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2.5 py-1 border border-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ Prev
          </button>
          <span className="px-2 text-gray-700 font-mono">
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
            <strong>{table.getPageCount() || 1}</strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2.5 py-1 border border-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next ›
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2.5 py-1 border border-black bg-white hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Last »
          </button>
        </div>

        <div className="text-gray-600 font-mono text-xs">
          Showing {table.getRowModel().rows.length} of {data.length} rows{" "}
          {hasActiveFilters && (
            <span className="text-blue-600 font-semibold">(filtered)</span>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import DataTable from "./data_table";

interface CsvViewerProps {
  data: Record<string, any>[];
  columns?: string[];
  fileName: string;
  onClose: () => void;
}

export default function CsvViewer({ data, columns, fileName, onClose }: CsvViewerProps) {
  const isTsv = fileName.toLowerCase().endsWith(".tsv");

  return (
    <div className="flex flex-col space-y-3">
      {/* File Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-black shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">📑</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-black">{fileName}</span>
              <span className="px-2 py-0.5 border border-black bg-gray-100 text-black text-[10px] font-mono font-semibold rounded">
                {isTsv ? "TSV (Tab-Separated)" : "CSV (Comma-Separated)"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.length.toLocaleString()} rows • {(columns?.length || Object.keys(data[0] || {}).length)} columns
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="border border-black px-3 py-1.5 bg-white hover:bg-gray-100 text-xs font-semibold"
        >
          ✕ Open Different File
        </button>
      </div>

      {/* Main Table Grid */}
      <DataTable
        data={data}
        columns={columns}
        title={fileName}
        subtitle="Sort, search, and paginate through records"
        exportFileName={fileName.replace(/\.[^/.]+$/, "")}
      />
    </div>
  );
}

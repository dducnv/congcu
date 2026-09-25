"use client";

import React, { useState } from "react";
import DataTable from "./data_table";

export interface ExcelWorkbookData {
  fileName: string;
  sheetNames: string[];
  sheets: Record<string, Record<string, any>[]>;
}

interface ExcelViewerProps {
  workbook: ExcelWorkbookData;
  onClose: () => void;
}

export default function ExcelViewer({ workbook, onClose }: ExcelViewerProps) {
  const [activeSheet, setActiveSheet] = useState<string>(
    workbook.sheetNames[0] || ""
  );

  const currentData = workbook.sheets[activeSheet] || [];

  return (
    <div className="flex flex-col space-y-3">
      {/* File Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-black shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">📊</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-black">{workbook.fileName}</span>
              <span className="px-2 py-0.5 border border-green-700 bg-green-50 text-green-800 text-[10px] font-mono font-semibold rounded">
                Excel Workbook
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {workbook.sheetNames.length} sheet{workbook.sheetNames.length > 1 ? "s" : ""} in workbook
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

      {/* Sheet Tabs Bar (Excel Style) */}
      <div className="flex items-center gap-1 border-b border-black overflow-x-auto pb-0 bg-gray-100 px-2 pt-2">
        <span className="text-xs font-semibold text-gray-500 px-2 py-1 select-none">
          Sheets:
        </span>
        {workbook.sheetNames.map((sheet) => {
          const rowCount = workbook.sheets[sheet]?.length || 0;
          const isActive = activeSheet === sheet;
          return (
            <button
              key={sheet}
              onClick={() => setActiveSheet(sheet)}
              className={`px-4 py-2 text-xs font-medium border-t border-l border-r border-black rounded-t transition-all flex items-center gap-2 ${
                isActive
                  ? "bg-white text-black font-bold shadow-sm -mb-px border-b-white z-10"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <span>{sheet}</span>
              <span className="text-[10px] opacity-70 font-mono">({rowCount})</span>
            </button>
          );
        })}
      </div>

      {/* Main Sheet Data Table */}
      <DataTable
        data={currentData}
        title={activeSheet}
        subtitle={`Viewing sheet "${activeSheet}" from ${workbook.fileName}`}
        exportFileName={`${workbook.fileName.replace(/\.[^/.]+$/, "")}_${activeSheet}`}
      />
    </div>
  );
}

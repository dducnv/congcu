"use client";

import React from "react";
import { useDropzone } from "react-dropzone";

interface FileDropzoneProps {
  onFileLoaded: (file: File) => void;
  onLoadSample?: (type: "csv" | "sql" | "json") => void;
  isLoading?: boolean;
  loadingMessage?: string;
}

export default function FileDropzone({
  onFileLoaded,
  onLoadSample,
  isLoading,
  loadingMessage,
}: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        onFileLoaded(acceptedFiles[0]);
      }
    },
    accept: {
      "text/csv": [".csv"],
      "text/tab-separated-values": [".tsv"],
      "text/plain": [".txt", ".csv", ".tsv", ".sql"],
      "application/vnd.ms-excel": [".csv", ".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/json": [".json"],
      "application/sql": [".sql"],
      "application/x-sqlite3": [".db", ".sqlite", ".sqlite3"],
      "application/octet-stream": [".db", ".sqlite", ".sqlite3"],
    },
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed border-black rounded-lg p-10 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-blue-600 bg-blue-50/80 scale-[1.01]"
            : "bg-white hover:border-gray-500 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-black border-t-transparent"></div>
            <p className="font-semibold text-sm text-black">{loadingMessage || "Reading data..."}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-3xl">📂</div>
            <div>
              <p className="text-base font-semibold text-black">
                Drag & drop your data file here, or <span className="underline">browse files</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                100% Client-Side Processing • Your files are never uploaded to any remote server
              </p>
            </div>

            {/* Supported format badges */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-2">
              <span className="px-2 py-0.5 border border-black bg-gray-100 font-mono text-[11px] font-semibold">
                .CSV / .TSV
              </span>
              <span className="px-2 py-0.5 border border-green-700 bg-green-50 text-green-800 font-mono text-[11px] font-semibold">
                .XLSX / .XLS (Excel)
              </span>
              <span className="px-2 py-0.5 border border-blue-700 bg-blue-50 text-blue-800 font-mono text-[11px] font-semibold">
                .DB / .SQLITE (SQLite)
              </span>
              <span className="px-2 py-0.5 border border-purple-700 bg-purple-50 text-purple-800 font-mono text-[11px] font-semibold">
                .SQL (Dump / Script)
              </span>
              <span className="px-2 py-0.5 border border-amber-700 bg-amber-50 text-amber-800 font-mono text-[11px] font-semibold">
                .JSON
              </span>
            </div>
          </div>
        )}
      </div>

      {onLoadSample && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
          <span>Or try with sample data:</span>
          <button
            type="button"
            onClick={() => onLoadSample("csv")}
            className="border border-black px-2.5 py-1 bg-white hover:bg-black hover:text-white transition-colors"
          >
            Sample CSV
          </button>
          <button
            type="button"
            onClick={() => onLoadSample("sql")}
            className="border border-black px-2.5 py-1 bg-white hover:bg-black hover:text-white transition-colors"
          >
            Sample SQLite DB
          </button>
          <button
            type="button"
            onClick={() => onLoadSample("json")}
            className="border border-black px-2.5 py-1 bg-white hover:bg-black hover:text-white transition-colors"
          >
            Sample JSON
          </button>
        </div>
      )}
    </div>
  );
}

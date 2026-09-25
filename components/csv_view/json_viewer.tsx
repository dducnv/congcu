"use client";

import React, { useState } from "react";
import DataTable from "./data_table";

interface JsonViewerProps {
  data: Record<string, any>[];
  rawJson: string;
  fileName: string;
  onClose: () => void;
}

export default function JsonViewer({ data, rawJson, fileName, onClose }: JsonViewerProps) {
  const [viewMode, setViewMode] = useState<"table" | "raw">("table");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* File Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-black shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">📄</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-black">{fileName}</span>
              <span className="px-2 py-0.5 border border-amber-700 bg-amber-50 text-amber-800 text-[10px] font-mono font-semibold rounded">
                JSON Document
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {data.length.toLocaleString()} record{data.length > 1 ? "s" : ""} parsed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex border border-black p-0.5 bg-gray-100">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                viewMode === "table" ? "bg-black text-white" : "bg-transparent text-black hover:bg-gray-200"
              }`}
            >
              📊 Table View
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 text-xs font-semibold transition-colors ${
                viewMode === "raw" ? "bg-black text-white" : "bg-transparent text-black hover:bg-gray-200"
              }`}
            >
              {`{ } Raw JSON`}
            </button>
          </div>

          <button
            onClick={onClose}
            className="border border-black px-3 py-1.5 bg-white hover:bg-gray-100 text-xs font-semibold"
          >
            ✕ Open Different File
          </button>
        </div>
      </div>

      {/* Content depending on viewMode */}
      {viewMode === "table" ? (
        <DataTable
          data={data}
          title={fileName}
          subtitle="Parsed JSON objects represented in tabular grid"
          exportFileName={fileName.replace(/\.[^/.]+$/, "")}
        />
      ) : (
        <div className="border border-black bg-white flex flex-col shadow-sm">
          <div className="p-3 border-b border-black bg-gray-50 flex justify-between items-center">
            <span className="text-xs font-bold text-black uppercase tracking-wider">
              Raw JSON Content
            </span>
            <button
              onClick={handleCopy}
              className="border border-black px-3 py-1 text-xs font-medium bg-white hover:bg-black hover:text-white transition-colors"
            >
              {copied ? "✓ Copied!" : "Copy JSON"}
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[650px] bg-gray-900 text-green-400 font-mono text-xs">
            <pre>{rawJson}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

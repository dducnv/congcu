"use client";

import React, { useState, useEffect, useMemo } from "react";
import DataTable from "./data_table";
import { TableSchema, SqlQueryResult, getTableData, executeQuery, exportDatabaseBinary } from "./sql_engine";

interface SqlViewerProps {
  db: any;
  tables: TableSchema[];
  fileName: string;
  onClose: () => void;
}

export default function SqlViewer({ db, tables, fileName, onClose }: SqlViewerProps) {
  const [selectedTable, setSelectedTable] = useState<string>(tables[0]?.name || "");
  const [tableSearch, setTableSearch] = useState("");
  const [showQueryBar, setShowQueryBar] = useState(false);
  const [queryInput, setQueryInput] = useState(`SELECT * FROM "${tables[0]?.name || "data"}" LIMIT 50;`);
  const [queryResult, setQueryResult] = useState<SqlQueryResult | null>(null);

  // Filtered tables for sidebar search
  const filteredTables = useMemo(() => {
    if (!tableSearch.trim()) return tables;
    const term = tableSearch.toLowerCase();
    return tables.filter((t) => t.name.toLowerCase().includes(term));
  }, [tables, tableSearch]);

  // Load data for the selected table
  const currentTableData = useMemo(() => {
    if (queryResult && !queryResult.error) {
      return {
        columns: queryResult.columns,
        rows: queryResult.rows,
        isQueryResult: true,
      };
    }
    if (!selectedTable || !db) return { columns: [], rows: [], isQueryResult: false };
    const { columns, rows } = getTableData(db, selectedTable);
    return { columns, rows, isQueryResult: false };
  }, [db, selectedTable, queryResult]);

  // When selected table changes, reset queryResult and update default query
  const handleSelectTable = (tblName: string) => {
    setSelectedTable(tblName);
    setQueryResult(null);
    setQueryInput(`SELECT * FROM "${tblName}" LIMIT 50;`);
  };

  const handleRunQuery = () => {
    if (!db || !queryInput.trim()) return;
    const res = executeQuery(db, queryInput);
    setQueryResult(res);
  };

  const handleResetToTable = () => {
    setQueryResult(null);
  };

  const handleExportDb = () => {
    if (!db) return;
    try {
      const binary = exportDatabaseBinary(db);
      const blob = new Blob([binary as any], { type: "application/x-sqlite3" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const cleanName = fileName ? fileName.replace(/\.[^/.]+$/, "") : "database";
      link.download = `${cleanName}.db`;
      link.click();
    } catch (err) {
      console.error("Export DB error:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      {/* File Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white border border-black shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗄️</span>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-black">{fileName}</span>
              <span className="px-2 py-0.5 border border-blue-700 bg-blue-50 text-blue-800 text-[10px] font-mono font-semibold rounded">
                SQLite Database
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {tables.length} table{tables.length > 1 ? "s" : ""} loaded in browser memory
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQueryBar(!showQueryBar)}
            className={`border border-black px-3 py-1.5 text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              showQueryBar ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
            }`}
          >
            <span>⚡ {showQueryBar ? "Hide Query Editor" : "SQL Query Editor"}</span>
          </button>

          <button
            onClick={handleExportDb}
            className="border border-black px-3 py-1.5 bg-white hover:bg-gray-100 text-xs font-semibold"
            title="Download SQLite .db file"
          >
            💾 Export .db
          </button>

          <button
            onClick={onClose}
            className="border border-black px-3 py-1.5 bg-white hover:bg-gray-100 text-xs font-semibold"
          >
            ✕ Open Different File
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout: Left Side Tables + Right Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Left Sidebar: Table List */}
        <div className="border border-black bg-white flex flex-col shadow-sm md:col-span-1 h-[680px]">
          <div className="p-3 border-b border-black bg-gray-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1">
                <span>📋 Tables</span>
                <span className="text-gray-500 font-normal">({tables.length})</span>
              </span>
            </div>
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter tables..."
              className="w-full border border-black px-2 py-1 text-xs bg-white focus:outline-none"
            />
          </div>

          {/* Tables scrollable list */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
            {filteredTables.map((t) => {
              const isSelected = selectedTable === t.name && !currentTableData.isQueryResult;
              return (
                <div
                  key={t.name}
                  onClick={() => handleSelectTable(t.name)}
                  className={`p-2.5 text-xs cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-black text-white font-semibold"
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-xs opacity-70">📄</span>
                    <span className="font-mono truncate">{t.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {t.rowCount.toLocaleString()}
                  </span>
                </div>
              );
            })}

            {filteredTables.length === 0 && (
              <div className="p-4 text-center text-xs text-gray-400">No tables match &quot;{tableSearch}&quot;</div>
            )}
          </div>
        </div>

        {/* Right Main Area: Query Console (Collapsible) + Data Table */}
        <div className="md:col-span-3 flex flex-col space-y-3">
          {/* Collapsible SQL Query Console */}
          {showQueryBar && (
            <div className="border border-black bg-white p-3 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-black uppercase tracking-wider">
                  SQL Query
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQueryInput(`SELECT * FROM "${selectedTable}" LIMIT 50;`)}
                    className="text-[11px] font-mono px-2 py-0.5 border border-gray-300 hover:border-black bg-gray-50"
                  >
                    SELECT * LIMIT 50
                  </button>
                  <button
                    type="button"
                    onClick={() => setQueryInput(`SELECT count(*) as total_rows FROM "${selectedTable}";`)}
                    className="text-[11px] font-mono px-2 py-0.5 border border-gray-300 hover:border-black bg-gray-50"
                  >
                    COUNT(*)
                  </button>
                </div>
              </div>

              <textarea
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                    e.preventDefault();
                    handleRunQuery();
                  }
                }}
                rows={3}
                placeholder="Enter SQL query (Ctrl+Enter to run)..."
                className="w-full border border-black p-2 font-mono text-xs focus:outline-none resize-y bg-white"
                spellCheck={false}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                <span className="text-[11px] text-gray-500">
                  Shortcut: <kbd className="border border-gray-300 px-1 py-0.5 text-[10px] bg-gray-100">Ctrl+Enter</kbd>
                </span>

                <div className="flex items-center gap-2">
                  {currentTableData.isQueryResult && (
                    <button
                      type="button"
                      onClick={handleResetToTable}
                      className="border border-black px-3 py-1 bg-white hover:bg-gray-100 text-xs font-medium"
                    >
                      ↺ Back to Table &quot;{selectedTable}&quot;
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleRunQuery}
                    className="border border-black px-4 py-1 bg-black text-white hover:bg-gray-800 text-xs font-semibold"
                  >
                    ▶ Run Query
                  </button>
                </div>
              </div>

              {queryResult?.error && (
                <div className="mt-2 p-2 border border-red-500 bg-red-50 text-red-700 text-xs font-mono">
                  <strong>Error:</strong> {queryResult.error}
                </div>
              )}

              {queryResult && !queryResult.error && (
                <div className="mt-2 text-[11px] font-mono text-green-700">
                  ✓ Executed in {queryResult.executionTimeMs} ms — {queryResult.rowCount} rows returned.
                </div>
              )}
            </div>
          )}

          {/* Main Data Table */}
          <DataTable
            data={currentTableData.rows}
            columns={currentTableData.columns}
            title={currentTableData.isQueryResult ? "Query Results" : selectedTable}
            subtitle={
              currentTableData.isQueryResult
                ? `Custom SQL query results`
                : `Viewing table "${selectedTable}"`
            }
            exportFileName={`${fileName.replace(/\.[^/.]+$/, "")}_${selectedTable}`}
            extraActions={
              currentTableData.isQueryResult ? (
                <button
                  onClick={handleResetToTable}
                  className="px-2.5 py-1 border border-black bg-white hover:bg-gray-100 text-xs font-medium"
                >
                  ↺ Reset View
                </button>
              ) : null
            }
          />
        </div>
      </div>
    </div>
  );
}

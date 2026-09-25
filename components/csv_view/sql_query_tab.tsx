"use client";

import React, { useState } from "react";
import { TableSchema, SqlQueryResult } from "./sql_engine";

interface SqlQueryTabProps {
  db: any;
  tables: TableSchema[];
  currentTable: string;
  onSelectTable: (tableName: string) => void;
  onExecuteQuery: (query: string) => SqlQueryResult;
  onResetData: () => void;
  queryResult: SqlQueryResult | null;
  activeQuery: string;
  setActiveQuery: (query: string) => void;
  onExportDb?: () => void;
}

export default function SqlQueryTab({
  db,
  tables,
  currentTable,
  onSelectTable,
  onExecuteQuery,
  onResetData,
  queryResult,
  activeQuery,
  setActiveQuery,
  onExportDb,
}: SqlQueryTabProps) {
  const [selectedSchemaTable, setSelectedSchemaTable] = useState<string>(
    currentTable || (tables[0]?.name ?? "")
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      onExecuteQuery(activeQuery);
    }
  };

  const insertSnippet = (snippet: string) => {
    setActiveQuery(activeQuery ? `${activeQuery.trim()} ${snippet}` : snippet);
  };

  const activeSchema = tables.find((t) => t.name === selectedSchemaTable) || tables[0];

  return (
    <div className="flex-1 flex flex-col space-y-4">
      {/* Top Banner & Quick Controls */}
      <div className="border border-black bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <span>⚡ SQL Query & Database Engine</span>
              <span className="text-xs bg-black text-white px-2 py-0.5 rounded font-mono font-normal">
                SQLite In-Browser
              </span>
            </h2>
            <p className="text-xs text-gray-600 mt-0.5">
              Execute full SQLite queries directly in your browser. All tabs (Data Table, Charts, Pivot) will reflect your query results.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onExportDb && (
              <button
                onClick={onExportDb}
                className="px-3 py-1.5 border border-black bg-white hover:bg-gray-100 text-xs font-medium"
                title="Export database to SQLite .db file"
              >
                💾 Export SQLite (.db)
              </button>
            )}
            <button
              onClick={onResetData}
              className="px-3 py-1.5 border border-black bg-gray-100 hover:bg-gray-200 text-xs font-medium"
              title="Reset data table to original full dataset"
            >
              ↺ Reset to Full Data
            </button>
          </div>
        </div>

        {/* Query Editor & Schema Sidebar Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Schema Explorer */}
          <div className="border border-black p-3 bg-gray-50 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Tables & Schema ({tables.length})
              </span>
            </div>

            <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {tables.map((t) => (
                <div
                  key={t.name}
                  onClick={() => {
                    setSelectedSchemaTable(t.name);
                    onSelectTable(t.name);
                  }}
                  className={`px-2 py-1.5 text-xs cursor-pointer border flex justify-between items-center transition-colors ${
                    selectedSchemaTable === t.name
                      ? "bg-black text-white border-black"
                      : "bg-white text-black border-gray-300 hover:border-black"
                  }`}
                >
                  <span className="font-mono truncate">{t.name}</span>
                  <span className="text-[10px] opacity-75">{t.rowCount} rows</span>
                </div>
              ))}
            </div>

            {activeSchema && (
              <div className="border-t border-gray-300 pt-2 flex-1">
                <span className="text-[11px] font-semibold text-gray-700 block mb-1">
                  Columns ({activeSchema.columns.length}):
                </span>
                <div className="flex flex-wrap gap-1 max-h-36 overflow-y-auto">
                  {activeSchema.columns.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => insertSnippet(`"${col}"`)}
                      className="px-1.5 py-0.5 bg-white border border-gray-300 hover:border-black text-[11px] font-mono"
                      title="Click to insert column into query"
                    >
                      {col}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Query Editor Area */}
          <div className="lg:col-span-3 flex flex-col space-y-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold mr-1">Quick Snippets:</span>
              <button
                type="button"
                onClick={() =>
                  setActiveQuery(
                    `SELECT * FROM "${selectedSchemaTable || tables[0]?.name || "data"}" LIMIT 50;`
                  )
                }
                className="px-2 py-1 bg-white border border-black hover:bg-gray-100 text-xs font-mono"
              >
                SELECT * LIMIT 50
              </button>
              <button
                type="button"
                onClick={() =>
                  insertSnippet(
                    `WHERE "${activeSchema?.columns[0] || "col"}" IS NOT NULL`
                  )
                }
                className="px-2 py-1 bg-white border border-black hover:bg-gray-100 text-xs font-mono"
              >
                WHERE
              </button>
              <button
                type="button"
                onClick={() =>
                  insertSnippet(
                    `GROUP BY "${activeSchema?.columns[0] || "col"}"`
                  )
                }
                className="px-2 py-1 bg-white border border-black hover:bg-gray-100 text-xs font-mono"
              >
                GROUP BY
              </button>
              <button
                type="button"
                onClick={() =>
                  insertSnippet(
                    `ORDER BY "${activeSchema?.columns[0] || "col"}" DESC`
                  )
                }
                className="px-2 py-1 bg-white border border-black hover:bg-gray-100 text-xs font-mono"
              >
                ORDER BY DESC
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveQuery(
                    `SELECT "${activeSchema?.columns[0] || "col"}", COUNT(*) as total FROM "${
                      selectedSchemaTable || "data"
                    }" GROUP BY "${activeSchema?.columns[0] || "col"}" ORDER BY total DESC;`
                  )
                }
                className="px-2 py-1 bg-white border border-black hover:bg-gray-100 text-xs font-mono"
              >
                COUNT(*) GROUP BY
              </button>
            </div>

            <div className="relative flex-1">
              <textarea
                value={activeQuery}
                onChange={(e) => setActiveQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`-- Enter SQL query here (Press Ctrl+Enter / Cmd+Enter to run)\nSELECT * FROM "${
                  selectedSchemaTable || "data"
                }" LIMIT 100;`}
                rows={5}
                className="w-full border border-black p-3 font-mono text-sm resize-y focus:outline-none bg-white"
                spellCheck={false}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="text-xs text-gray-500">
                Tip: Press <kbd className="border border-gray-400 px-1 py-0.5 rounded text-[10px] bg-gray-100">Ctrl+Enter</kbd> to run
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveQuery("")}
                  className="px-3 py-1.5 border border-black bg-white hover:bg-gray-100 text-xs"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => onExecuteQuery(activeQuery)}
                  className="px-5 py-1.5 border border-black bg-black text-white hover:bg-gray-800 text-xs font-semibold flex items-center gap-1.5"
                >
                  <span>▶ Run Query</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status / Error Message */}
        {queryResult?.error && (
          <div className="mt-3 p-3 border border-red-500 bg-red-50 text-red-700 text-xs font-mono">
            <strong>SQL Error:</strong> {queryResult.error}
          </div>
        )}

        {queryResult && !queryResult.error && (
          <div className="mt-3 p-2.5 border border-green-500 bg-green-50 text-green-800 text-xs flex items-center justify-between">
            <span className="font-mono">
              ✓ Executed in <strong>{queryResult.executionTimeMs} ms</strong> — Returned <strong>{queryResult.rowCount}</strong> rows and <strong>{queryResult.columns.length}</strong> columns.
            </span>
            <span className="text-[11px] text-green-700">
              Data Table & Charts updated!
            </span>
          </div>
        )}
      </div>

      {/* Query Results Preview */}
      {queryResult && queryResult.rows.length > 0 && (
        <div className="border border-black bg-white p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-sm">
              Query Result Preview ({queryResult.rows.length} rows)
            </h3>
            <span className="text-xs text-gray-500">
              Showing top 10 preview rows
            </span>
          </div>

          <div className="overflow-x-auto border border-gray-300 max-h-64">
            <table className="min-w-full text-xs text-left">
              <thead className="bg-gray-100 border-b border-gray-300 font-mono">
                <tr>
                  {queryResult.columns.map((col) => (
                    <th key={col} className="px-3 py-2 border-r border-gray-300">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 font-mono">
                {queryResult.rows.slice(0, 10).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-gray-50">
                    {queryResult.columns.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-1.5 border-r border-gray-200 truncate max-w-xs"
                      >
                        {String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

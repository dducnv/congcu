"use client";

import React, { useState, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

import FileDropzone from "./file_dropzone";
import CsvViewer from "./csv_viewer";
import ExcelViewer, { ExcelWorkbookData } from "./excel_viewer";
import SqlViewer from "./sql_viewer";
import JsonViewer from "./json_viewer";
import {
  createDbFromBinary,
  createDbFromSql,
  getTables,
  TableSchema,
} from "./sql_engine";

type ActiveFileType = "csv" | "excel" | "sql" | "json" | null;

export default function CsvView() {
  const [activeFileType, setActiveFileType] = useState<ActiveFileType>(null);
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  // CSV Data State
  const [csvData, setCsvData] = useState<Record<string, any>[]>([]);
  const [csvColumns, setCsvColumns] = useState<string[]>([]);

  // Excel Data State
  const [excelWorkbook, setExcelWorkbook] = useState<ExcelWorkbookData | null>(null);

  // SQL / SQLite Data State
  const [sqlDb, setSqlDb] = useState<any>(null);
  const [sqlTables, setSqlTables] = useState<TableSchema[]>([]);

  // JSON Data State
  const [jsonData, setJsonData] = useState<Record<string, any>[]>([]);
  const [rawJson, setRawJson] = useState("");

  // Clear all states to open a new file
  const handleClose = () => {
    setActiveFileType(null);
    setFileName("");
    setCsvData([]);
    setCsvColumns([]);
    setExcelWorkbook(null);
    setSqlDb(null);
    setSqlTables([]);
    setJsonData([]);
    setRawJson("");
    setIsLoading(false);
  };

  // Main file loader handler
  const handleFileLoaded = useCallback((file: File) => {
    const lowerName = file.name.toLowerCase();
    setFileName(file.name);
    setIsLoading(true);

    // 1. SQLite Database (.db, .sqlite, .sqlite3)
    if (lowerName.endsWith(".db") || lowerName.endsWith(".sqlite") || lowerName.endsWith(".sqlite3")) {
      setLoadingMessage(`Loading SQLite database: ${file.name}...`);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const db = await createDbFromBinary(buffer);
          const tables = getTables(db);
          setSqlDb(db);
          setSqlTables(tables);
          setActiveFileType("sql");
        } catch (err: any) {
          console.error("SQLite load error:", err);
          alert("Error opening SQLite file: " + (err.message || err));
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 2. SQL Dump / Script (.sql)
    if (lowerName.endsWith(".sql")) {
      setLoadingMessage(`Parsing SQL dump script: ${file.name}...`);
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          const db = await createDbFromSql(text);
          const tables = getTables(db);
          setSqlDb(db);
          setSqlTables(tables);
          setActiveFileType("sql");
        } catch (err: any) {
          console.error("SQL script error:", err);
          alert("Error reading SQL script: " + (err.message || err));
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
      return;
    }

    // 3. Excel (.xlsx, .xls)
    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      setLoadingMessage(`Parsing Excel workbook sheets: ${file.name}...`);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileData = e.target?.result;
          if (fileData) {
            const workbook = XLSX.read(fileData, { type: "binary" });
            const sheetNames = workbook.SheetNames;
            const sheets: Record<string, Record<string, any>[]> = {};

            sheetNames.forEach((sheet) => {
              const worksheet = workbook.Sheets[sheet];
              sheets[sheet] = XLSX.utils.sheet_to_json(worksheet);
            });

            setExcelWorkbook({
              fileName: file.name,
              sheetNames,
              sheets,
            });
            setActiveFileType("excel");
          }
        } catch (err: any) {
          console.error("Excel load error:", err);
          alert("Error reading Excel workbook: " + (err.message || err));
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsBinaryString(file);
      return;
    }

    // 4. JSON (.json)
    if (lowerName.endsWith(".json")) {
      setLoadingMessage(`Parsing JSON document: ${file.name}...`);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          setRawJson(text);
          const parsed = JSON.parse(text);
          let arrayData: Record<string, any>[] = [];

          if (Array.isArray(parsed)) {
            arrayData = parsed;
          } else if (parsed && typeof parsed === "object") {
            const arrKey = Object.keys(parsed).find((k) => Array.isArray(parsed[k]));
            if (arrKey) {
              arrayData = parsed[arrKey];
            } else {
              arrayData = [parsed];
            }
          }

          setJsonData(arrayData);
          setActiveFileType("json");
        } catch (err: any) {
          console.error("JSON parse error:", err);
          alert("Error parsing JSON: " + (err.message || err));
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsText(file);
      return;
    }

    // 5. CSV, TSV, or Plain text
    setLoadingMessage(`Parsing CSV data: ${file.name}...`);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as Record<string, any>[];
        setCsvData(data);
        setCsvColumns(Object.keys(data[0] || {}));
        setActiveFileType("csv");
        setIsLoading(false);
      },
      error: (err) => {
        console.error("CSV parse error:", err);
        alert("Error reading CSV file: " + err.message);
        setIsLoading(false);
      },
    });
  }, []);

  // Sample data loader for quick testing
  const handleLoadSample = async (type: "csv" | "sql" | "json") => {
    setIsLoading(true);
    if (type === "csv") {
      setLoadingMessage("Loading sample CSV...");
      const sampleCsv = `id,customer,product,category,price,status,date\n101,John Doe,MacBook Pro,Electronics,1999,Delivered,2026-03-12\n102,Jane Smith,Wireless Mouse,Accessories,49,Shipped,2026-03-14\n103,Alex Johnson,Coffee Mug,Home,15,Delivered,2026-03-15\n104,Sarah Williams,Desk Lamp,Furniture,79,Pending,2026-03-16\n105,Michael Brown,Mechanical Keyboard,Accessories,129,Delivered,2026-03-18\n106,Emily Davis,USB-C Monitor,Electronics,450,Delivered,2026-03-20`;
      Papa.parse(sampleCsv, {
        header: true,
        complete: (res) => {
          setCsvData(res.data as Record<string, any>[]);
          setCsvColumns(Object.keys(res.data[0] || {}));
          setFileName("sample_orders.csv");
          setActiveFileType("csv");
          setIsLoading(false);
        },
      });
    } else if (type === "sql") {
      setLoadingMessage("Creating sample SQLite database with tables...");
      const sqlDump = `
        CREATE TABLE "users" ("id" INT, "name" TEXT, "email" TEXT, "role" TEXT, "department" TEXT);
        INSERT INTO "users" VALUES (1, 'Alice Smith', 'alice@company.com', 'Manager', 'Engineering');
        INSERT INTO "users" VALUES (2, 'Bob Johnson', 'bob@company.com', 'Senior Dev', 'Engineering');
        INSERT INTO "users" VALUES (3, 'Charlie Lee', 'charlie@company.com', 'Designer', 'Product');
        INSERT INTO "users" VALUES (4, 'Diana Prince', 'diana@company.com', 'Lead QA', 'Engineering');
        INSERT INTO "users" VALUES (5, 'Evan Wright', 'evan@company.com', 'Product Manager', 'Product');

        CREATE TABLE "projects" ("id" INT, "project_name" TEXT, "status" TEXT, "budget" INT, "lead_id" INT);
        INSERT INTO "projects" VALUES (101, 'NextGen Mobile App', 'In Progress', 45000, 1);
        INSERT INTO "projects" VALUES (102, 'Cloud Data Lake', 'Planning', 80000, 2);
        INSERT INTO "projects" VALUES (103, 'Brand Identity Redesign', 'Completed', 15000, 3);
        INSERT INTO "projects" VALUES (104, 'Security Audit 2026', 'In Progress', 25000, 4);
      `;
      try {
        const db = await createDbFromSql(sqlDump);
        const tables = getTables(db);
        setSqlDb(db);
        setSqlTables(tables);
        setFileName("company_database.db");
        setActiveFileType("sql");
      } catch (e) {
        console.error("Sample SQL error:", e);
      } finally {
        setIsLoading(false);
      }
    } else if (type === "json") {
      setLoadingMessage("Loading sample JSON...");
      const sample = [
        { id: 1, title: "Learn Next.js 14", completed: true, tags: ["frontend", "react"] },
        { id: 2, title: "Optimize WebAssembly SQLite", completed: true, tags: ["wasm", "sqlite"] },
        { id: 3, title: "Implement Topic Clusters for SEO", completed: true, tags: ["marketing", "seo"] },
        { id: 4, title: "Deploy to Vercel Production", completed: false, tags: ["devops", "cloud"] },
      ];
      setJsonData(sample);
      setRawJson(JSON.stringify(sample, null, 2));
      setFileName("sample_tasks.json");
      setActiveFileType("json");
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 min-h-screen flex flex-col space-y-4">
      {/* If no file is opened, show Dropzone Hero */}
      {!activeFileType && (
        <div className="max-w-4xl mx-auto w-full pt-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-black tracking-tight">
              Universal Data Viewer & SQL Query Engine
            </h1>
            <p className="text-sm text-gray-600 mt-2 max-w-xl mx-auto">
              Open, inspect, and query CSV, Excel (.xlsx), SQLite (.db), SQL dumps, and JSON files directly in your browser without uploading to any server.
            </p>
          </div>

          <FileDropzone
            onFileLoaded={handleFileLoaded}
            onLoadSample={handleLoadSample}
            isLoading={isLoading}
            loadingMessage={loadingMessage}
          />
        </div>
      )}

      {/* 1. Excel Workbook View (with Sheet switcher) */}
      {activeFileType === "excel" && excelWorkbook && (
        <ExcelViewer workbook={excelWorkbook} onClose={handleClose} />
      )}

      {/* 2. SQL / SQLite Database View (with Table sidebar & Query bar) */}
      {activeFileType === "sql" && sqlDb && (
        <SqlViewer
          db={sqlDb}
          tables={sqlTables}
          fileName={fileName}
          onClose={handleClose}
        />
      )}

      {/* 3. CSV / TSV View */}
      {activeFileType === "csv" && (
        <CsvViewer
          data={csvData}
          columns={csvColumns}
          fileName={fileName}
          onClose={handleClose}
        />
      )}

      {/* 4. JSON View */}
      {activeFileType === "json" && (
        <JsonViewer
          data={jsonData}
          rawJson={rawJson}
          fileName={fileName}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

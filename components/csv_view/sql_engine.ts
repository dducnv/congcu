"use client";

// Types
export interface TableSchema {
  name: string;
  columns: string[];
  rowCount: number;
}

export interface SqlQueryResult {
  columns: string[];
  rows: Record<string, any>[];
  executionTimeMs: number;
  rowCount: number;
  error?: string;
}

declare global {
  interface Window {
    initSqlJs?: (config?: any) => Promise<any>;
  }
}

let sqlJsPromise: Promise<any> | null = null;

/**
 * Dynamically loads and initializes sql.js with WebAssembly
 */
export async function getSqlJs(): Promise<any> {
  if (sqlJsPromise) {
    return sqlJsPromise;
  }

  sqlJsPromise = new Promise(async (resolve, reject) => {
    try {
      if (typeof window === "undefined") {
        return reject(new Error("SQL engine is only available in the browser"));
      }

      if (!window.initSqlJs) {
        await new Promise<void>((res, rej) => {
          const script = document.createElement("script");
          script.src = "/sqljs/sql-wasm.js";
          script.async = true;
          script.onload = () => res();
          script.onerror = () => {
            // Fallback to CDN
            const fallback = document.createElement("script");
            fallback.src = "https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js";
            fallback.async = true;
            fallback.onload = () => res();
            fallback.onerror = () => rej(new Error("Failed to load SQL engine"));
            document.head.appendChild(fallback);
          };
          document.head.appendChild(script);
        });
      }

      const SQL = await window.initSqlJs!({
        locateFile: (file: string) => `/sqljs/${file}`,
      });
      resolve(SQL);
    } catch (error) {
      sqlJsPromise = null;
      reject(error);
    }
  });

  return sqlJsPromise;
}

/**
 * Creates an in-memory SQLite database from a binary SQLite file (.db, .sqlite, .sqlite3)
 */
export async function createDbFromBinary(arrayBuffer: ArrayBuffer): Promise<any> {
  const SQL = await getSqlJs();
  const uInt8Array = new Uint8Array(arrayBuffer);
  return new SQL.Database(uInt8Array);
}

/**
 * Sanitizes SQL dumps (e.g. MySQL, PostgreSQL, MariaDB) for SQLite syntax compatibility
 */
export function sanitizeSqlDump(sql: string): string {
  return sql
    // Remove MySQL set commands
    .replace(/^\s*SET\s+.*?;/gim, "")
    // Remove LOCK / UNLOCK TABLES
    .replace(/^\s*(UN)?LOCK\s+TABLES.*?;/gim, "")
    // Remove table options like ENGINE=InnoDB, DEFAULT CHARSET=..., COLLATE=...
    .replace(/ENGINE\s*=\s*[A-Za-z0-9_]+/gi, "")
    .replace(/DEFAULT\s+CHARSET\s*=\s*[A-Za-z0-9_]+/gi, "")
    .replace(/CHARACTER\s+SET\s+[A-Za-z0-9_]+/gi, "")
    .replace(/COLLATE\s*=?\s*[A-Za-z0-9_]+/gi, "")
    .replace(/AUTO_INCREMENT/gi, "")
    // Remove conditional comment commands like /*!40101 ... */
    .replace(/\/\*![\s\S]*?\*\//g, "");
}

/**
 * Creates an in-memory SQLite database from a SQL text dump (.sql)
 */
export async function createDbFromSql(sqlText: string): Promise<any> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();
  const sanitized = sanitizeSqlDump(sqlText);

  try {
    db.run(sanitized);
  } catch (err: any) {
    // If running entire script fails, attempt statement-by-statement execution
    console.warn("Bulk SQL execution had errors, attempting statement-by-statement parsing:", err);
    const statements = sanitized
      .split(/;\s*$/m)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        db.run(stmt + ";");
      } catch (subErr) {
        console.warn("Skipping failed statement:", stmt.slice(0, 80), subErr);
      }
    }
  }

  return db;
}

/**
 * Creates an in-memory SQLite database from JavaScript / CSV / JSON object array
 */
export async function createDbFromData(
  data: Record<string, any>[],
  tableName: string = "data"
): Promise<any> {
  const SQL = await getSqlJs();
  const db = new SQL.Database();

  if (!data || data.length === 0) {
    return db;
  }

  const safeTableName = tableName.replace(/[^a-zA-Z0-9_]/g, "_") || "data";
  const columns = Object.keys(data[0]);

  if (columns.length === 0) {
    return db;
  }

  // Create table
  const colDefs = columns
    .map((col) => `"${col.replace(/"/g, '""')}" TEXT`)
    .join(", ");
  db.run(`CREATE TABLE "${safeTableName}" (${colDefs});`);

  // Insert rows in batches for performance
  const placeholders = columns.map(() => "?").join(", ");
  const insertSql = `INSERT INTO "${safeTableName}" VALUES (${placeholders});`;
  const stmt = db.prepare(insertSql);

  db.run("BEGIN TRANSACTION;");
  for (const row of data) {
    const values = columns.map((col) => {
      const val = row[col];
      return val !== undefined && val !== null ? String(val) : null;
    });
    stmt.run(values);
  }
  stmt.free();
  db.run("COMMIT;");

  return db;
}

/**
 * Returns list of tables and row counts in a SQLite database
 */
export function getTables(db: any): TableSchema[] {
  try {
    const res = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
    );
    if (!res || res.length === 0 || !res[0].values) {
      return [];
    }

    const tableNames: string[] = res[0].values.map((v: any[]) => String(v[0]));
    const tables: TableSchema[] = [];

    for (const name of tableNames) {
      let rowCount = 0;
      let columns: string[] = [];

      try {
        const countRes = db.exec(`SELECT count(*) as count FROM "${name}";`);
        if (countRes.length > 0 && countRes[0].values.length > 0) {
          rowCount = Number(countRes[0].values[0][0]) || 0;
        }

        const colRes = db.exec(`PRAGMA table_info("${name}");`);
        if (colRes.length > 0) {
          columns = colRes[0].values.map((row: any[]) => String(row[1]));
        }
      } catch (e) {
        console.error(`Error querying table ${name}:`, e);
      }

      tables.push({ name, columns, rowCount });
    }

    return tables;
  } catch (err) {
    console.error("Error getting tables from SQLite database:", err);
    return [];
  }
}

/**
 * Reads all rows (or up to limit) from a specific table in SQLite database
 */
export function getTableData(
  db: any,
  tableName: string,
  limit?: number
): { columns: string[]; rows: Record<string, any>[] } {
  try {
    const query = limit
      ? `SELECT * FROM "${tableName}" LIMIT ${limit};`
      : `SELECT * FROM "${tableName}";`;
    const res = db.exec(query);

    if (!res || res.length === 0) {
      return { columns: [], rows: [] };
    }

    const columns: string[] = res[0].columns;
    const rows = res[0].values.map((row: any[]) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    return { columns, rows };
  } catch (err) {
    console.error(`Error fetching table data for ${tableName}:`, err);
    return { columns: [], rows: [] };
  }
}

/**
 * Executes a custom SQL query and returns result set with execution timing
 */
export function executeQuery(db: any, query: string): SqlQueryResult {
  const startTime = performance.now();
  try {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        columns: [],
        rows: [],
        executionTimeMs: 0,
        rowCount: 0,
      };
    }

    const res = db.exec(trimmed);
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;

    if (!res || res.length === 0) {
      return {
        columns: [],
        rows: [],
        executionTimeMs,
        rowCount: 0,
      };
    }

    const lastResult = res[res.length - 1];
    const columns: string[] = lastResult.columns || [];
    const rows = (lastResult.values || []).map((row: any[]) => {
      const obj: Record<string, any> = {};
      columns.forEach((col, idx) => {
        obj[col] = row[idx];
      });
      return obj;
    });

    return {
      columns,
      rows,
      executionTimeMs,
      rowCount: rows.length,
    };
  } catch (err: any) {
    const executionTimeMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      columns: [],
      rows: [],
      executionTimeMs,
      rowCount: 0,
      error: err.message || "Failed to execute SQL query",
    };
  }
}

/**
 * Exports the SQLite database to a downloadable Uint8Array binary
 */
export function exportDatabaseBinary(db: any): Uint8Array {
  return db.export();
}

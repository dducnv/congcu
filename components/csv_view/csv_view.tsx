"use client";

import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import Papa from 'papaparse';
import React, { useCallback, useMemo, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis, YAxis
} from 'recharts';

// Types
interface CSVData {
  [key: string]: any;
}

interface ColumnStats {
  name: string;
  type: string;
  count: number;
  nullCount: number;
  nullPercentage: number;
  mean?: number;
  median?: number;
  min?: number;
  max?: number;
  uniqueValues: number;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap';
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count';
}

const CsvView: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnStats, setColumnStats] = useState<ColumnStats[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({ type: 'bar' });
  const [activeTab, setActiveTab] = useState<'table' | 'stats' | 'charts' | 'pivot'>('table');
  const [pivotConfig, setPivotConfig] = useState({
    groupBy: '',
    values: '',
    aggregation: 'sum' as 'sum' | 'avg' | 'count'
  });

  // Correlation Matrix
  const calculateCorrelations = useCallback((data: CSVData[], stats: ColumnStats[]) => {
    const numericColumns = stats.filter(stat => stat.type === 'numeric');
    const matrix: number[][] = [];

    numericColumns.forEach((col1, i) => {
      const row: number[] = [];
      numericColumns.forEach((col2, j) => {
        if (i === j) {
          row.push(1);
        } else {
          const values1 = data.map(row => Number(row[col1.name])).filter(v => !isNaN(v));
          const values2 = data.map(row => Number(row[col2.name])).filter(v => !isNaN(v));
          const correlation = calculateCorrelation(values1, values2);
          row.push(correlation);
        }
      });
      matrix.push(row);
    });

    setCorrelationMatrix(matrix);
  }, []);

  // Schema Detection & Statistics
  const calculateStatistics = useCallback((data: CSVData[]) => {
    const currentColumns = Object.keys(data[0] || {});
    const stats: ColumnStats[] = currentColumns.map(col => {
      const values = data.map(row => row[col]).filter(val => val !== null && val !== undefined && val !== '');
      const numericValues = values.filter(val => !isNaN(Number(val))).map(Number);

      return {
        name: col,
        type: numericValues.length > values.length * 0.8 ? 'numeric' : 'string',
        count: values.length,
        nullCount: data.length - values.length,
        nullPercentage: ((data.length - values.length) / data.length) * 100,
        mean: numericValues.length > 0 ? numericValues.reduce((a, b) => a + b, 0) / numericValues.length : undefined,
        median: numericValues.length > 0 ? numericValues.sort((a, b) => a - b)[Math.floor(numericValues.length / 2)] : undefined,
        min: numericValues.length > 0 ? Math.min(...numericValues) : undefined,
        max: numericValues.length > 0 ? Math.max(...numericValues) : undefined,
        uniqueValues: new Set(values).size
      };
    });

    setColumnStats(stats);
    calculateCorrelations(data, stats);
  }, [calculateCorrelations]);

  // CSV Upload & Parsing
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as CSVData[];
          setCsvData(data);
          setColumns(Object.keys(data[0] || {}));
          calculateStatistics(data);
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
        }
      });
    }
  }, [calculateStatistics]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    }
  });


  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = Math.min(x.length, y.length);
    if (n === 0) return 0;

    const sumX = x.slice(0, n).reduce((a, b) => a + b, 0);
    const sumY = y.slice(0, n).reduce((a, b) => a + b, 0);
    const sumXY = x.slice(0, n).reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.slice(0, n).reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.slice(0, n).reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  };

  // Table Configuration
  const columnHelper = useMemo(() => createColumnHelper<CSVData>(), []);
  const tableColumns = useMemo(() =>
    columns.map(col =>
      columnHelper.accessor(col, {
        header: col,
        cell: info => info.getValue(),
        enableSorting: true,
        enableColumnFilter: true,
      })
    ), [columns, columnHelper]
  );

  const table = useReactTable({
    data: csvData,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 50,
      },
    },
  });

  // Chart Data Generation
  const generateChartData = () => {
    if (!chartConfig.xAxis || !csvData.length) return [];

    if (chartConfig.type === 'pie') {
      const counts: { [key: string]: number } = {};
      csvData.forEach(row => {
        const value = row[chartConfig.xAxis!];
        counts[value] = (counts[value] || 0) + 1;
      });
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    if (chartConfig.type === 'scatter' && chartConfig.yAxis) {
      return csvData.map(row => ({
        x: Number(row[chartConfig.xAxis!]) || 0,
        y: Number(row[chartConfig.yAxis!]) || 0,
      }));
    }

    if (chartConfig.groupBy) {
      const grouped: { [key: string]: number } = {};
      csvData.forEach(row => {
        const group = row[chartConfig.groupBy!];
        const value = Number(row[chartConfig.xAxis!]) || 0;
        grouped[group] = (grouped[group] || 0) + value;
      });
      return Object.entries(grouped).map(([name, value]) => ({ name, value }));
    }

    return csvData.map((row, index) => ({
      name: `Row ${index + 1}`,
      value: Number(row[chartConfig.xAxis!]) || 0,
    }));
  };

  // Pivot Table
  const generatePivotData = () => {
    if (!pivotConfig.groupBy || !pivotConfig.values) return [];

    const grouped: { [key: string]: number[] } = {};
    csvData.forEach(row => {
      const group = row[pivotConfig.groupBy];
      const value = Number(row[pivotConfig.values]) || 0;
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push(value);
    });

    return Object.entries(grouped).map(([group, values]) => {
      let result = 0;
      switch (pivotConfig.aggregation) {
        case 'sum':
          result = values.reduce((a, b) => a + b, 0);
          break;
        case 'avg':
          result = values.reduce((a, b) => a + b, 0) / values.length;
          break;
        case 'count':
          result = values.length;
          break;
      }
      return { group, value: result };
    });
  };

  // Render Chart
  const renderChart = () => {
    const data = generateChartData();
    if (!data.length) return <div>No data available</div>;

    switch (chartConfig.type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`hsl(${index * 360 / data.length}, 70%, 50%)`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'scatter':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={data}>
              <CartesianGrid />
              <XAxis dataKey="x" name={chartConfig.xAxis} />
              <YAxis dataKey="y" name={chartConfig.yAxis} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter dataKey="y" fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      default:
        return <div>Select a chart type</div>;
    }
  };

  // Correlation Heatmap
  const renderCorrelationHeatmap = () => {
    if (!correlationMatrix.length) return <div>No correlation data</div>;

    const numericColumns = columnStats.filter(stat => stat.type === 'numeric');

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Column</th>
              {numericColumns.map(col => (
                <th key={col.name} className="px-4 py-2 text-center text-sm">
                  {col.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {numericColumns.map((col, i) => (
              <tr key={col.name}>
                <td className="px-4 py-2 font-medium">{col.name}</td>
                {correlationMatrix[i]?.map((value, j) => (
                  <td
                    key={j}
                    className={`px-4 py-2 text-center text-sm ${value > 0.7 ? 'bg-red-100' :
                      value > 0.3 ? 'bg-yellow-100' :
                        value > -0.3 ? 'bg-gray-100' :
                          value > -0.7 ? 'bg-blue-100' : 'bg-purple-100'
                      }`}
                  >
                    {value.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <h1 className="text-2xl font-bold mb-4">CSV Data Viewer & Analyzer</h1>

      {/* File Upload */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the CSV file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop a CSV file here, or click to select</p>
                <p className="text-sm text-gray-500">Supports .csv files</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {csvData.length > 0 && (
        <>
          {/* Navigation Tabs */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {[
                { id: 'table', label: 'Data Table' },
                { id: 'stats', label: 'Statistics' },
                { id: 'charts', label: 'Charts' },
                { id: 'pivot', label: 'Pivot Table' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-2 border border-black font-medium text-sm transition-colors ${activeTab === tab.id
                    ? 'bg-black text-white'
                    : 'bg-white text-black hover:bg-gray-100'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table View */}
          {activeTab === 'table' && (
            <div className="border border-black bg-white flex-1 flex flex-col">
              <div className="p-4 border-b border-black flex-shrink-0">
                <div className="flex flex-wrap gap-3 items-center">
                  <h2 className="text-lg font-semibold">Data Table ({csvData.length} rows)</h2>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="border border-black px-3 py-2 min-w-60"
                    onChange={(e) => table.setGlobalFilter(e.target.value)}
                  />
                  <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="border border-black px-3 py-2"
                  >
                    <option value={25}>25 rows</option>
                    <option value={50}>50 rows</option>
                    <option value={100}>100 rows</option>
                    <option value={200}>200 rows</option>
                  </select>
                </div>
              </div>

              <div className="overflow-auto flex-1 border border-black">
                <table className="min-w-full">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th
                            key={header.id}
                            className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black cursor-pointer hover:bg-gray-200 min-w-32"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getIsSorted() === 'asc' ? ' ↑' : header.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="bg-white">
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-3 text-sm text-black max-w-48 truncate" title={String(cell.getValue())}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-4 py-3 border-t border-black flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => table.setPageIndex(0)}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 border border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    First
                  </button>
                  <button
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="px-3 py-1 border border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 border border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                    disabled={!table.getCanNextPage()}
                    className="px-3 py-1 border border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Last
                  </button>
                </div>
                <div className="text-sm text-black">
                  Showing {table.getRowModel().rows.length} of {csvData.length} rows | Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                </div>
              </div>
            </div>
          )}

          {/* Statistics View */}
          {activeTab === 'stats' && (
            <div className="flex-1 flex flex-col space-y-6">
              <div className="border border-black bg-white p-6 flex-1">
                <h2 className="text-lg font-semibold mb-4">Column Statistics</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="border-b border-black">
                        <th className="text-left py-2 px-2">Column</th>
                        <th className="text-left py-2 px-2">Type</th>
                        <th className="text-left py-2 px-2">Count</th>
                        <th className="text-left py-2 px-2">Null %</th>
                        <th className="text-left py-2 px-2">Unique</th>
                        <th className="text-left py-2 px-2">Mean</th>
                        <th className="text-left py-2 px-2">Min</th>
                        <th className="text-left py-2 px-2">Max</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columnStats.map((stat, index) => (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-2 px-2 font-medium">{stat.name}</td>
                          <td className="py-2 px-2">
                            <span className={`px-2 py-1 border border-black text-xs ${stat.type === 'numeric' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {stat.type}
                            </span>
                          </td>
                          <td className="py-2 px-2">{stat.count}</td>
                          <td className="py-2 px-2">{stat.nullPercentage.toFixed(1)}%</td>
                          <td className="py-2 px-2">{stat.uniqueValues}</td>
                          <td className="py-2 px-2">{stat.mean?.toFixed(2) || '-'}</td>
                          <td className="py-2 px-2">{stat.min?.toFixed(2) || '-'}</td>
                          <td className="py-2 px-2">{stat.max?.toFixed(2) || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border border-black bg-white p-6">
                <h2 className="text-lg font-semibold mb-4">Correlation Matrix</h2>
                {renderCorrelationHeatmap()}
              </div>
            </div>
          )}

          {/* Charts View */}
          {activeTab === 'charts' && (
            <div className="border border-black bg-white p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Chart Builder</h2>

              <div className="flex flex-wrap gap-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Chart Type</label>
                  <select
                    value={chartConfig.type}
                    onChange={(e) => setChartConfig({ ...chartConfig, type: e.target.value as any })}
                    className="border border-black px-3 py-2"
                  >
                    <option value="bar">Bar Chart</option>
                    <option value="line">Line Chart</option>
                    <option value="pie">Pie Chart</option>
                    <option value="scatter">Scatter Plot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">X-Axis</label>
                  <select
                    value={chartConfig.xAxis || ''}
                    onChange={(e) => setChartConfig({ ...chartConfig, xAxis: e.target.value })}
                    className="border border-black px-3 py-2"
                  >
                    <option value="">Select column</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                {chartConfig.type === 'scatter' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Y-Axis</label>
                    <select
                      value={chartConfig.yAxis || ''}
                      onChange={(e) => setChartConfig({ ...chartConfig, yAxis: e.target.value })}
                      className="border border-black px-3 py-2"
                    >
                      <option value="">Select column</option>
                      {columns.map(col => (
                        <option key={col} value={col}>{col}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="border border-black p-4 flex-1">
                {renderChart()}
              </div>
            </div>
          )}

          {/* Pivot Table View */}
          {activeTab === 'pivot' && (
            <div className="border border-black bg-white p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Pivot Table</h2>

              <div className="flex flex-wrap gap-3 mb-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Group By</label>
                  <select
                    value={pivotConfig.groupBy}
                    onChange={(e) => setPivotConfig({ ...pivotConfig, groupBy: e.target.value })}
                    className="border border-black px-3 py-2"
                  >
                    <option value="">Select column</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Values</label>
                  <select
                    value={pivotConfig.values}
                    onChange={(e) => setPivotConfig({ ...pivotConfig, values: e.target.value })}
                    className="border border-black px-3 py-2"
                  >
                    <option value="">Select column</option>
                    {columns.map(col => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Aggregation</label>
                  <select
                    value={pivotConfig.aggregation}
                    onChange={(e) => setPivotConfig({ ...pivotConfig, aggregation: e.target.value as any })}
                    className="border border-black px-3 py-2"
                  >
                    <option value="sum">Sum</option>
                    <option value="avg">Average</option>
                    <option value="count">Count</option>
                  </select>
                </div>
              </div>

              <div className="border border-black flex-1 overflow-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Group</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generatePivotData().map((row, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-black">
                          {row.group}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-black">
                          {row.value.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CsvView;

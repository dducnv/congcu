"use client";

import { createColumnHelper, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import Papa from 'papaparse';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import * as XLSX from 'xlsx';

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
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'heatmap' | 'boxplot' | 'histogram';
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  aggregation?: 'sum' | 'avg' | 'count';
  bins?: number; // For histogram
}

const CsvView: React.FC = () => {
  const [csvData, setCsvData] = useState<CSVData[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnStats, setColumnStats] = useState<ColumnStats[]>([]);
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([]);
  const [chartConfig, setChartConfig] = useState<ChartConfig>({ type: 'bar' });
  const [activeTab, setActiveTab] = useState<'table' | 'stats' | 'charts' | 'pivot' | 'duplicates' | 'quality'>('table');

  // Advanced filtering state
  const [columnFilters, setColumnFilters] = useState<{ [key: string]: string }>({});
  const [showFilters, setShowFilters] = useState(false);
  const [pivotConfig, setPivotConfig] = useState({
    groupBy: '',
    values: '',
    aggregation: 'sum' as 'sum' | 'avg' | 'count'
  });

  // Duplicate detection state
  const [duplicateConfig, setDuplicateConfig] = useState({
    selectedColumns: [] as string[]
  });
  const [uniqueData, setUniqueData] = useState<CSVData[]>([]);
  const [duplicateStats, setDuplicateStats] = useState({
    total: 0,
    unique: 0,
    duplicates: 0
  });

  // Refs for scroll synchronization
  const topScrollRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const bottomScrollRef = useRef<HTMLDivElement>(null);

  // Scroll functions
  const scrollLeft = () => {
    const scrollAmount = 200;
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollLeft -= scrollAmount;
    }
  };

  const scrollRight = () => {
    const scrollAmount = 200;
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollLeft += scrollAmount;
    }
  };

  // Scroll synchronization
  useEffect(() => {
    const topScroll = topScrollRef.current;
    const mainScroll = mainScrollRef.current;
    const bottomScroll = bottomScrollRef.current;

    if (!topScroll || !mainScroll || !bottomScroll) return;

    const syncScroll = (source: HTMLDivElement, targets: HTMLDivElement[]) => {
      const scrollLeft = source.scrollLeft;
      targets.forEach(target => {
        if (target !== source) {
          target.scrollLeft = scrollLeft;
        }
      });
    };

    const handleTopScroll = () => syncScroll(topScroll, [mainScroll, bottomScroll]);
    const handleMainScroll = () => syncScroll(mainScroll, [topScroll, bottomScroll]);
    const handleBottomScroll = () => syncScroll(bottomScroll, [topScroll, mainScroll]);

    topScroll.addEventListener('scroll', handleTopScroll);
    mainScroll.addEventListener('scroll', handleMainScroll);
    bottomScroll.addEventListener('scroll', handleBottomScroll);

    return () => {
      topScroll.removeEventListener('scroll', handleTopScroll);
      mainScroll.removeEventListener('scroll', handleMainScroll);
      bottomScroll.removeEventListener('scroll', handleBottomScroll);
    };
  }, [csvData.length]);

  // Find unique rows based on selected columns
  const findUniqueRows = useCallback(() => {
    if (!csvData.length || !duplicateConfig.selectedColumns.length) {
      setUniqueData(csvData);
      setDuplicateStats({
        total: csvData.length,
        unique: csvData.length,
        duplicates: 0
      });
      return;
    }

    const seen = new Map<string, CSVData>();
    const cols = duplicateConfig.selectedColumns;

    csvData.forEach((row) => {
      // Create key from selected columns
      const key = cols.map(col => String(row[col] || '')).join('|||');

      if (!seen.has(key)) {
        seen.set(key, row);
      }
    });

    const uniqueRows = Array.from(seen.values());
    setUniqueData(uniqueRows);
    setDuplicateStats({
      total: csvData.length,
      unique: uniqueRows.length,
      duplicates: csvData.length - uniqueRows.length
    });
  }, [csvData, duplicateConfig.selectedColumns]);

  // Auto-run when config changes
  useEffect(() => {
    findUniqueRows();
  }, [findUniqueRows]);

  // Export functions
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, 'data.xlsx');
  };

  const exportToJSON = () => {
    const json = JSON.stringify(csvData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'data.json');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUniqueData = () => {
    const csv = Papa.unparse(uniqueData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'unique_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  // File Upload & Parsing
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        // Handle Excel files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const fileData = e.target?.result;
            if (fileData) {
              const workbook = XLSX.read(fileData, { type: 'binary' });
              const sheetName = workbook.SheetNames[0];
              const worksheet = workbook.Sheets[sheetName];
              const jsonData = XLSX.utils.sheet_to_json(worksheet);

              const excelData = jsonData as CSVData[];
              setCsvData(excelData);
              setColumns(Object.keys(excelData[0] || {}));
              calculateStatistics(excelData);
            }
          } catch (error) {
            console.error('Excel parsing error:', error);
          }
        };
        reader.readAsBinaryString(file);
      } else {
        // Handle CSV files
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
    }
  }, [calculateStatistics]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
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

  // Apply column filters
  const filteredData = useMemo(() => {
    if (Object.keys(columnFilters).length === 0) return csvData;

    return csvData.filter(row => {
      return Object.entries(columnFilters).every(([column, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = String(row[column] || '').toLowerCase();
        return cellValue.includes(filterValue.toLowerCase());
      });
    });
  }, [csvData, columnFilters]);

  const table = useReactTable({
    data: filteredData,
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

    if (chartConfig.type === 'heatmap') {
      const numericColumns = columnStats.filter(stat => stat.type === 'numeric');
      const matrix: { [key: string]: any } = {};

      numericColumns.forEach((col1, i) => {
        numericColumns.forEach((col2, j) => {
          if (i !== j) {
            const values1 = csvData.map(row => Number(row[col1.name])).filter(v => !isNaN(v));
            const values2 = csvData.map(row => Number(row[col2.name])).filter(v => !isNaN(v));
            const correlation = calculateCorrelation(values1, values2);
            matrix[`${col1.name}-${col2.name}`] = {
              x: col1.name,
              y: col2.name,
              value: correlation
            };
          }
        });
      });
      return Object.values(matrix);
    }

    if (chartConfig.type === 'boxplot') {
      const numericColumns = columnStats.filter(stat => stat.type === 'numeric');
      return numericColumns.map(stat => {
        const values = csvData.map(row => Number(row[stat.name])).filter(v => !isNaN(v)).sort((a, b) => a - b);
        const q1 = values[Math.floor(values.length * 0.25)];
        const median = values[Math.floor(values.length * 0.5)];
        const q3 = values[Math.floor(values.length * 0.75)];
        const min = Math.min(...values);
        const max = Math.max(...values);

        return {
          name: stat.name,
          min,
          q1,
          median,
          q3,
          max,
          outliers: values.filter(v => v < q1 - 1.5 * (q3 - q1) || v > q3 + 1.5 * (q3 - q1))
        };
      });
    }

    if (chartConfig.type === 'histogram') {
      const values = csvData.map(row => Number(row[chartConfig.xAxis!])).filter(v => !isNaN(v));
      const min = Math.min(...values);
      const max = Math.max(...values);
      const bins = chartConfig.bins || 10;
      const binSize = (max - min) / bins;

      const histogram: { [key: string]: number } = {};
      for (let i = 0; i < bins; i++) {
        const start = min + i * binSize;
        const end = min + (i + 1) * binSize;
        const label = `${start.toFixed(1)}-${end.toFixed(1)}`;
        histogram[label] = 0;
      }

      values.forEach(value => {
        const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1);
        const start = min + binIndex * binSize;
        const end = min + (binIndex + 1) * binSize;
        const label = `${start.toFixed(1)}-${end.toFixed(1)}`;
        histogram[label]++;
      });

      return Object.entries(histogram).map(([name, value]) => ({ name, value }));
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

      case 'heatmap':
        return (
          <div className="w-full h-96 overflow-auto">
            <div className="grid gap-1" style={{
              gridTemplateColumns: `repeat(${Math.sqrt(data.length)}, 1fr)`,
              aspectRatio: '1/1'
            }}>
              {data.map((item: any, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center text-xs font-medium"
                  style={{
                    backgroundColor: `hsl(${120 + (item.value * 120)}, 70%, 50%)`,
                    color: Math.abs(item.value) > 0.5 ? 'white' : 'black'
                  }}
                  title={`${item.x} vs ${item.y}: ${item.value.toFixed(3)}`}
                >
                  {item.value.toFixed(2)}
                </div>
              ))}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Correlation Heatmap: Red = High correlation, Green = Low correlation
            </div>
          </div>
        );

      case 'boxplot':
        return (
          <div className="w-full h-96 overflow-auto">
            <div className="space-y-4">
              {data.map((item: any, index) => (
                <div key={index} className="border border-black p-4">
                  <h4 className="font-semibold mb-2">{item.name}</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">Min: {item.min.toFixed(2)}</span>
                        <span className="text-sm">Q1: {item.q1.toFixed(2)}</span>
                        <span className="text-sm font-bold">Median: {item.median.toFixed(2)}</span>
                        <span className="text-sm">Q3: {item.q3.toFixed(2)}</span>
                        <span className="text-sm">Max: {item.max.toFixed(2)}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-4 relative">
                        <div
                          className="absolute bg-blue-500 h-4"
                          style={{
                            left: '0%',
                            width: '100%',
                            background: `linear-gradient(to right, 
                              #3b82f6 0%, 
                              #3b82f6 ${((item.q1 - item.min) / (item.max - item.min)) * 100}%, 
                              #10b981 ${((item.q1 - item.min) / (item.max - item.min)) * 100}%, 
                              #10b981 ${((item.q3 - item.min) / (item.max - item.min)) * 100}%, 
                              #3b82f6 ${((item.q3 - item.min) / (item.max - item.min)) * 100}%, 
                              #3b82f6 100%)`
                          }}
                        ></div>
                        <div
                          className="absolute bg-red-500 w-1 h-4"
                          style={{
                            left: `${((item.median - item.min) / (item.max - item.min)) * 100}%`
                          }}
                        ></div>
                      </div>
                      {item.outliers.length > 0 && (
                        <div className="text-xs text-red-600 mt-1">
                          Outliers: {item.outliers.length} values
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'histogram':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
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
                <p className="text-lg mb-2">Drag & drop a file here, or click to select</p>
                <p className="text-sm text-gray-500">Supports .csv, .xlsx, .xls files</p>
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
                { id: 'pivot', label: 'Pivot Table' },
                { id: 'duplicates', label: 'Remove Duplicates' },
                { id: 'quality', label: 'Data Quality' }
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
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex flex-wrap gap-3 items-center">
                    <h2 className="text-lg font-semibold">Data Table ({csvData.length} rows)</h2>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="border border-black px-3 py-2 min-w-60"
                      onChange={(e) => table.setGlobalFilter(e.target.value)}
                    />
                    <button
                      onClick={() => setShowFilters(!showFilters)}
                      className={`px-3 py-2 border border-black font-medium text-sm transition-colors ${showFilters ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                        }`}
                    >
                      🔍 Filters
                    </button>
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

                  {/* Export buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={exportToExcel}
                      className="px-3 py-2 border border-black bg-green-600 text-white hover:bg-green-700 flex items-center gap-1"
                      title="Export to Excel"
                    >

                      <span className="hidden sm:inline">Export Excel</span>
                    </button>
                    <button
                      onClick={exportToJSON}
                      className="px-3 py-2 border border-black bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1"
                      title="Export to JSON"
                    >
                      <span className="hidden sm:inline">Export JSON</span>
                    </button>
                  </div>

                  {/* Scroll buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={scrollLeft}
                      className="px-3 py-2 border border-black bg-white text-black hover:bg-gray-100 flex items-center gap-1"
                      title="Scroll left"
                    >
                      <span>←</span>
                      <span className="hidden sm:inline">Scroll Left</span>
                    </button>
                    <button
                      onClick={scrollRight}
                      className="px-3 py-2 border border-black bg-white text-black hover:bg-gray-100 flex items-center gap-1"
                      title="Scroll right"
                    >
                      <span className="hidden sm:inline">Scroll Right</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Advanced Filters */}
              {showFilters && (
                <div className="p-4 border-b border-black bg-gray-50">
                  <h3 className="font-semibold mb-3">Column Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {columns.map(col => (
                      <div key={col} className="flex flex-col">
                        <label className="text-sm font-medium text-black mb-1">{col}</label>
                        <input
                          type="text"
                          placeholder={`Filter ${col}...`}
                          value={columnFilters[col] || ''}
                          onChange={(e) => setColumnFilters({ ...columnFilters, [col]: e.target.value })}
                          className="border border-black px-3 py-2 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => setColumnFilters({})}
                      className="px-3 py-1 border border-black bg-white text-black hover:bg-gray-100 text-sm"
                    >
                      Clear All
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="px-3 py-1 border border-black bg-gray-600 text-white hover:bg-gray-700 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 border border-black flex flex-col">
                {/* Top scrollbar */}
                <div
                  ref={topScrollRef}
                  className="overflow-x-auto overflow-y-hidden border-b border-gray-300"
                  style={{ height: '17px' }}
                >
                  <div style={{ height: '1px', minWidth: '800px' }}></div>
                </div>

                {/* Main table container */}
                <div
                  ref={mainScrollRef}
                  className="overflow-x-auto overflow-y-auto flex-1"
                >
                  <table className="min-w-full table-fixed" style={{ minWidth: '800px' }}>
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map(header => (
                            <th
                              key={header.id}
                              className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black cursor-pointer hover:bg-gray-200 min-w-32 whitespace-nowrap"
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
                            <td key={cell.id} className="px-4 py-3 text-sm text-black min-w-32 max-w-48 truncate" title={String(cell.getValue())}>
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Bottom scrollbar */}
                <div
                  ref={bottomScrollRef}
                  className="overflow-x-auto overflow-y-hidden border-t border-gray-300"
                  style={{ height: '17px' }}
                >
                  <div style={{ height: '1px', minWidth: '800px' }}></div>
                </div>
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

                <div className="flex items-center gap-3">
                  {/* Bottom scroll buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={scrollLeft}
                      className="px-2 py-1 border border-black bg-white text-black hover:bg-gray-100 text-sm"
                      title="Scroll left"
                    >
                      ←
                    </button>
                    <button
                      onClick={scrollRight}
                      className="px-2 py-1 border border-black bg-white text-black hover:bg-gray-100 text-sm"
                      title="Scroll right"
                    >
                      →
                    </button>
                  </div>

                  <div className="text-sm text-black">
                    Showing {table.getRowModel().rows.length} of {csvData.length} rows | Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                  </div>
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
                    <option value="heatmap">Heatmap</option>
                    <option value="boxplot">Box Plot</option>
                    <option value="histogram">Histogram</option>
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

                {chartConfig.type === 'histogram' && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-1">Number of Bins</label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={chartConfig.bins || 10}
                      onChange={(e) => setChartConfig({ ...chartConfig, bins: parseInt(e.target.value) || 10 })}
                      className="border border-black px-3 py-2"
                    />
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

          {/* Data Quality Report */}
          {activeTab === 'quality' && (
            <div className="border border-black bg-white p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Data Quality Report</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Overall Quality Score */}
                <div className="border border-black p-4">
                  <h3 className="font-semibold mb-2">Overall Quality Score</h3>
                  <div className="text-3xl font-bold text-green-600">
                    {Math.round((1 - (columnStats.reduce((sum, stat) => sum + stat.nullPercentage, 0) / (columnStats.length * 100))) * 100)}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Data completeness</p>
                </div>

                {/* Missing Data */}
                <div className="border border-black p-4">
                  <h3 className="font-semibold mb-2">Missing Data</h3>
                  <div className="text-2xl font-bold text-red-600">
                    {columnStats.reduce((sum, stat) => sum + stat.nullCount, 0)}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Total missing values</p>
                </div>

                {/* Data Types */}
                <div className="border border-black p-4">
                  <h3 className="font-semibold mb-2">Data Types</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Numeric:</span>
                      <span className="font-semibold text-blue-600">
                        {columnStats.filter(s => s.type === 'numeric').length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Text:</span>
                      <span className="font-semibold text-green-600">
                        {columnStats.filter(s => s.type === 'string').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Column Analysis */}
              <div className="border border-black flex-1 overflow-auto">
                <h3 className="font-semibold mb-3 p-4 border-b border-black">Column Quality Analysis</h3>
                <table className="min-w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Column</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Completeness</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Unique Values</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Quality Score</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black">Issues</th>
                    </tr>
                  </thead>
                  <tbody>
                    {columnStats.map((stat, index) => {
                      const completeness = ((stat.count / csvData.length) * 100).toFixed(1);
                      const qualityScore = Math.round((1 - (stat.nullPercentage / 100)) * 100);
                      const issues = [];

                      if (stat.nullPercentage > 50) issues.push('High missing data');
                      if (stat.uniqueValues < 5) issues.push('Low diversity');
                      if (stat.type === 'numeric' && stat.mean === undefined) issues.push('Invalid numeric data');

                      return (
                        <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-black">{stat.name}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 text-xs rounded ${stat.type === 'numeric' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                              }`}>
                              {stat.type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${parseFloat(completeness) > 80 ? 'bg-green-500' :
                                    parseFloat(completeness) > 50 ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}
                                  style={{ width: `${completeness}%` }}
                                ></div>
                              </div>
                              <span className="text-xs">{completeness}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">{stat.uniqueValues}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-semibold ${qualityScore > 80 ? 'text-green-600' :
                              qualityScore > 50 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                              {qualityScore}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            {issues.length > 0 ? (
                              <div className="space-y-1">
                                {issues.map((issue, i) => (
                                  <span key={i} className="block text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
                                    {issue}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-green-600 text-xs">✓ Good</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Duplicate Detection View */}
          {activeTab === 'duplicates' && (
            <div className="border border-black bg-white p-6 flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-4">Remove Duplicates</h2>

              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Select columns to identify duplicate data. Only the first record of each duplicate group will be kept.
                </p>

                <div className="border border-black p-4 mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Select columns to compare:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {columns.map(col => (
                      <label key={col} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={duplicateConfig.selectedColumns.includes(col)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setDuplicateConfig({
                                ...duplicateConfig,
                                selectedColumns: [...duplicateConfig.selectedColumns, col]
                              });
                            } else {
                              setDuplicateConfig({
                                ...duplicateConfig,
                                selectedColumns: duplicateConfig.selectedColumns.filter(c => c !== col)
                              });
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{col}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 border border-black p-4 mb-4">
                  <h3 className="font-semibold mb-2">Statistics:</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600">Total Rows:</div>
                      <div className="text-lg font-semibold">{duplicateStats.total}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Unique Rows:</div>
                      <div className="text-lg font-semibold text-green-600">{duplicateStats.unique}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Duplicate Rows:</div>
                      <div className="text-lg font-semibold text-red-600">{duplicateStats.duplicates}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    onClick={exportUniqueData}
                    disabled={!uniqueData.length}
                    className="px-4 py-2 border border-black bg-black text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Export Unique Data (.csv)
                  </button>
                  <button
                    onClick={() => {
                      setCsvData(uniqueData);
                      setActiveTab('table');
                    }}
                    disabled={!uniqueData.length}
                    className="px-4 py-2 border border-black bg-white text-black hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Replace Current Data
                  </button>
                </div>
              </div>

              {/* Preview unique data */}
              {uniqueData.length > 0 && (
                <div className="flex-1 flex flex-col">
                  <h3 className="font-semibold mb-2">Preview Unique Data:</h3>
                  <div className="border border-black flex-1 overflow-auto">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 sticky top-0">
                        <tr>
                          {columns.map(col => (
                            <th key={col} className="px-4 py-3 text-left text-xs font-medium text-black border-b border-black min-w-32">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {uniqueData.slice(0, 100).map((row, index) => (
                          <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                            {columns.map(col => (
                              <td key={col} className="px-4 py-3 text-sm text-black max-w-48 truncate" title={String(row[col])}>
                                {String(row[col])}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {uniqueData.length > 100 && (
                    <p className="text-sm text-gray-600 mt-2">
                      Showing first 100 rows. Total: {uniqueData.length} unique rows.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CsvView;

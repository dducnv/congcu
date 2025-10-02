"use client"
import { JsonEditor } from 'json-edit-react';
import React, { useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';

// Custom CSS for json-edit-react
const customStyles = `
  .jer-editor-container {
    font-family: ui-monospace, SFMono-Regular, Monaco, Consolas, monospace !important;
    font-size: 14px !important;
  }
  .jer-editor-container .jer-key {
    font-weight: 600;
    color: #0066cc;
  }
  .jer-editor-container .jer-value-string {
    color: #22863a;
  }
  .jer-editor-container .jer-value-number {
    color: #6f42c1;
  }
  .jer-editor-container .jer-value-boolean {
    color: #e36209;
  }
  .jer-editor-container .jer-value-null {
    color: #d73a49;
  }
`;

// Component wrapper cho json-edit-react
const JsonViewWrapper = React.memo(({
  value,
  onChange,
  readOnly = false,
  placeholder = ''
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [jsonData, setJsonData] = useState<any>(null);

  // Update local value when prop changes
  React.useEffect(() => {
    setLocalValue(value);
    try {
      const parsed = value.trim() ? JSON.parse(value) : null;
      setJsonData(parsed);
    } catch (e) {
      setJsonData(null);
    }
  }, [value]);

  // Debounced onChange
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const debouncedOnChange = React.useCallback((newValue: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      onChange?.(newValue);
    }, 300);
  }, [onChange]);

  // Handle JSON editor changes
  const handleJsonChange = React.useCallback((data: any) => {
    try {
      const newValue = JSON.stringify(data, null, 2);
      setLocalValue(newValue);
      debouncedOnChange(newValue);
    } catch (e) {
      console.error('Error serializing JSON:', e);
    }
  }, [debouncedOnChange]);

  // If no value or invalid JSON, show text editor
  if (!localValue.trim() || jsonData === null) {
    return (
      <div className="border border-black p-4 bg-gray-50 min-h-[400px]">
        <textarea
          value={localValue}
          onChange={(e) => {
            setLocalValue(e.target.value);
            debouncedOnChange(e.target.value);
          }}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full h-full resize-none border-none bg-transparent font-mono text-sm outline-none"
          style={{ minHeight: '400px' }}
        />
      </div>
    );
  }

  return (
    <div className="border border-black bg-white min-h-[400px] overflow-auto">
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <JsonEditor
        data={jsonData}
        setData={readOnly ? undefined : handleJsonChange}
        restrictEdit={readOnly}
        restrictDelete={readOnly}
        restrictAdd={readOnly}
        restrictTypeSelection={readOnly}
        rootName="root"
        enableClipboard={true}
        showArrayIndices={true}
        showStringQuotes={true}
        stringTruncate={100}

      />
    </div>
  );
});

JsonViewWrapper.displayName = 'JsonViewWrapper';

const JsonViewerPage = () => {
  const [leftInput, setLeftInput] = useState('');
  const [rightInput, setRightInput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState('fix'); // 'fix', 'format', 'diff', 'validate', 'search'
  const [indentSize, setIndentSize] = useState(2);
  const [diffInput, setDiffInput] = useState(''); // Separate input for diff mode
  const [searchTerm, setSearchTerm] = useState(''); // Search term
  const [searchResults, setSearchResults] = useState(''); // Search results
  const [fileName, setFileName] = useState(''); // Current file name

  // Fix JSON - sửa JSON không đúng format
  const fixJson = React.useCallback((input: string): string => {
    try {
      // Thử parse trực tiếp trước
      JSON.parse(input);
      return input; // Đã đúng format
    } catch (e) {
      // Sửa các lỗi thường gặp
      let fixed = input;

      // 1. Thêm quotes cho keys không có quotes
      fixed = fixed.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');

      // 2. Thêm quotes cho values string không có quotes
      fixed = fixed.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*([,}])/g, ': "$1"$2');

      // 3. Sửa single quotes thành double quotes
      fixed = fixed.replace(/'/g, '"');

      // 4. Thêm dấu phẩy thiếu
      fixed = fixed.replace(/([}\]])\s*([a-zA-Z_$"0-9])/g, '$1, $2');

      // 5. Xóa dấu phẩy thừa trước } hoặc ]
      fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

      try {
        const obj = JSON.parse(fixed);
        return JSON.stringify(obj, null, 2);
      } catch (e2) {
        return `// Không thể sửa JSON tự động. \n\n${fixed}`;
      }
    }
  }, []);

  // Format JSON với indent tùy chỉnh
  const formatJson = React.useCallback((input: string, indent: number = 2): string => {
    try {
      const obj = JSON.parse(input);
      return JSON.stringify(obj, null, indent);
    } catch (e) {
      return '';
    }
  }, []);


  // Validate JSON
  const validateJson = React.useCallback((input: string): boolean => {
    try {
      JSON.parse(input);
      return true;
    } catch (e) {
      return false;
    }
  }, []);


  // Search trong JSON
  const searchInJson = React.useCallback((json: any, term: string): string => {
    if (!term.trim()) return '';

    const results: string[] = [];
    const searchRecursive = (obj: any, path: string = 'root') => {
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            searchRecursive(item, `${path}[${index}]`);
          });
        } else {
          Object.entries(obj).forEach(([key, value]) => {
            const currentPath = path === 'root' ? key : `${path}.${key}`;

            // Search in key
            if (key.toLowerCase().includes(term.toLowerCase())) {
              results.push(`🔑 Key: ${currentPath} = ${JSON.stringify(value)}`);
            }

            // Search in value
            if (typeof value === 'string' && value.toLowerCase().includes(term.toLowerCase())) {
              results.push(`📝 Value: ${currentPath} = "${value}"`);
            }

            // Recursive search
            if (typeof value === 'object' && value !== null) {
              searchRecursive(value, currentPath);
            }
          });
        }
      }
    };

    searchRecursive(json);
    return results.length > 0
      ? `Tìm thấy ${results.length} kết quả:\n\n${results.join('\n')}`
      : 'Không tìm thấy kết quả nào.';
  }, []);

  const compareObjects = React.useCallback((obj1: any, obj2: any): any => {
    const diff: any = {};
    const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

    allKeys.forEach(key => {
      if (obj1[key] !== obj2[key]) {
        diff[key] = {
          old: obj1[key],
          new: obj2[key]
        };
      }
    });
    return diff;
  }, []);

  // So sánh 2 JSON
  const compareJson = React.useCallback(() => {
    try {
      const obj1 = JSON.parse(leftInput);
      const obj2 = JSON.parse(diffInput);
      const diff = compareObjects(obj1, obj2);
      return JSON.stringify(diff, null, 2);
    } catch (e) {
      return '';
    }
  }, [leftInput, diffInput, compareObjects]);

  // Copy to clipboard
  const handleCopy = React.useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, []);

  // Download JSON file
  const handleDownload = React.useCallback((content: string, filename: string = 'output.json') => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  // Handle file upload
  const handleFileUpload = React.useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setLeftInput(content);
      setFileName(file.name);
      setError('');
    };
    reader.onerror = () => {
      setError('Lỗi đọc file!');
    };
    reader.readAsText(file);
  }, []);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file && file.type === 'application/json') {
        handleFileUpload(file);
      } else {
        setError('Vui lòng chọn file JSON!');
      }
    },
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  // Auto process khi input thay đổi
  useEffect(() => {
    if (!leftInput.trim()) {
      setRightInput('');
      setError('');
      setSearchResults('');
      return;
    }

    setError(''); // Clear error

    if (viewMode === 'fix') {
      const fixed = fixJson(leftInput);
      setRightInput(fixed);
    } else if (viewMode === 'format') {
      const isValid = validateJson(leftInput);
      if (!isValid) {
        setError('JSON không hợp lệ!');
        setRightInput('');
        return;
      }
      const formatted = formatJson(leftInput, indentSize);
      setRightInput(formatted);
    } else if (viewMode === 'validate') {
      const isValid = validateJson(leftInput);
      if (isValid) {
        setRightInput('✅ JSON hợp lệ!');
        setError('');
      } else {
        setError('❌ JSON không hợp lệ!');
        setRightInput('');
      }
    } else if (viewMode === 'search' && searchTerm.trim()) {
      try {
        const json = JSON.parse(leftInput);
        const results = searchInJson(json, searchTerm);
        setSearchResults(results);
        setRightInput(results);
      } catch (e) {
        setError('JSON không hợp lệ!');
        setRightInput('');
      }
    }
  }, [leftInput, viewMode, indentSize, searchTerm, validateJson, formatJson, fixJson, searchInJson]);

  // Separate effect for diff mode
  useEffect(() => {
    if (viewMode === 'diff' && leftInput.trim() && diffInput.trim()) {
      const diff = compareJson();
      if (diff) {
        setRightInput(diff);
      }
    }
  }, [viewMode, compareJson, leftInput, diffInput]);


  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">JSON Multi-Tool</h1>

      {/* File Upload Area */}
      <div className="mb-6">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed border-black rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-gray-600">
            {isDragActive ? (
              <p>Drop the JSON file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop a JSON file here, or click to select</p>
                <p className="text-sm text-gray-500">Supports .json files</p>
                {fileName && (
                  <p className="text-sm text-green-600 mt-2">📁 Loaded: {fileName}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="text-red-500 mb-4 p-3 border border-red-300 bg-red-50 rounded">
          {error}
        </div>
      )}

      <div className="my-6 p-4 border border-black bg-gray-50">
        <div className="flex flex-wrap items-center gap-4">
          {/* View Mode Buttons */}
          <div className="flex gap-2 flex-wrap">
            <button
              className={`px-3 py-2 text-sm border ${viewMode === 'fix'
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
                }`}
              onClick={() => setViewMode('fix')}
            >
              🔧 Fix JSON
            </button>
            <button
              className={`px-3 py-2 text-sm border ${viewMode === 'format'
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
                }`}
              onClick={() => setViewMode('format')}
            >
              📋 Format
            </button>
            <button
              className={`px-3 py-2 text-sm border ${viewMode === 'validate'
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
                }`}
              onClick={() => setViewMode('validate')}
            >
              ✅ Validate
            </button>
            <button
              className={`px-3 py-2 text-sm border ${viewMode === 'search'
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
                }`}
              onClick={() => setViewMode('search')}
            >
              🔍 Search
            </button>
            <button
              className={`px-3 py-2 text-sm border ${viewMode === 'diff'
                ? 'border-black bg-black text-white'
                : 'border-gray-300 bg-white hover:bg-gray-100'
                }`}
              onClick={() => setViewMode('diff')}
            >
              ⚖️ Compare
            </button>
          </div>

          {/* Search Input */}
          {viewMode === 'search' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Tìm kiếm:</label>
              <input
                type="text"
                className="border border-gray-300 px-3 py-1 text-sm rounded"
                placeholder="Nhập từ khóa..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* Indent Size Selector */}
          {viewMode === 'format' && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Indent:</label>
              <select
                className="border border-gray-300 px-2 py-1 text-sm"
                value={indentSize}
                onChange={e => setIndentSize(Number(e.target.value))}
              >
                <option value={2}>2 spaces</option>
                <option value={4}>4 spaces</option>
                <option value={8}>8 spaces</option>
                <option value={0}>Tab</option>
              </select>
            </div>
          )}

          {/* Validation Status */}
          <div className="flex items-center gap-2">
            {leftInput.trim() && (
              <div className={`px-2 py-1 text-xs rounded ${validateJson(leftInput)
                ? 'bg-green-100 text-green-800 border border-green-300'
                : 'bg-red-100 text-red-800 border border-red-300'
                }`}>
                {validateJson(leftInput) ? '✅ Valid JSON' : '❌ Invalid JSON'}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 ml-auto">
            {fileName && (
              <button
                className="px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-100"
                onClick={() => {
                  setFileName('');
                  setLeftInput('');
                  setRightInput('');
                  setError('');
                }}
              >
                Clear File
              </button>
            )}
            <button
              className="px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-100"
              onClick={() => {
                setLeftInput('');
                setRightInput('');
                setError('');
                setFileName('');
              }}
            >
              Clear All
            </button>
            <button
              className="px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-100"
              onClick={() => {
                if (rightInput.trim()) {
                  setLeftInput(rightInput);
                }
              }}
              disabled={!rightInput.trim()}
            >
              ← Copy Right to Left
            </button>
            <button
              className="px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-100"
              onClick={() => {
                if (leftInput.trim()) {
                  setRightInput(leftInput);
                }
              }}
              disabled={!leftInput.trim()}
            >
              Copy Left to Right →
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout - 2 hoặc 3 phần màn hình */}
      <div className={`grid gap-6 ${viewMode === 'diff' ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Left Panel - Input */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <label className="font-semibold">JSON Input</label>
              {fileName && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  📁 {fileName}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                onClick={() => {
                  const formatted = formatJson(leftInput, indentSize);
                  if (formatted && !error) {
                    setLeftInput(formatted);
                  }
                }}
                disabled={!leftInput.trim()}
              >
                Quick Format
              </button>
              <button
                className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                onClick={() => handleCopy(leftInput)}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="flex-1">
            <JsonViewWrapper
              value={leftInput}
              onChange={setLeftInput}
              placeholder="Dán hoặc nhập JSON tại đây..."
            />
          </div>
        </div>

        {/* Right Panel - Output */}
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <label className="font-semibold">
              {viewMode === 'diff' ? 'JSON 2 (for comparison)' : 'Output'}
            </label>
            <div className="flex items-center gap-2">
              <button
                className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                onClick={() => handleCopy(viewMode === 'diff' ? diffInput : rightInput)}
                disabled={viewMode === 'diff' ? !diffInput.trim() : !rightInput.trim()}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              {viewMode !== 'search' && viewMode !== 'validate' && (
                <button
                  className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                  onClick={() => handleDownload(viewMode === 'diff' ? diffInput : rightInput, `output-${viewMode}.json`)}
                  disabled={viewMode === 'diff' ? !diffInput.trim() : !rightInput.trim()}
                >
                  💾 Download
                </button>
              )}
            </div>
          </div>
          <div className="flex-1">
            {viewMode === 'diff' ? (
              <JsonViewWrapper
                value={diffInput}
                onChange={setDiffInput}
                placeholder="Nhập JSON thứ 2 để so sánh..."
              />
            ) : viewMode === 'search' ? (
              <div className="border border-black p-4 bg-gray-50 min-h-[400px]">
                <pre className="whitespace-pre-wrap font-mono text-sm">
                  {rightInput || 'Kết quả tìm kiếm sẽ hiển thị ở đây...'}
                </pre>
              </div>
            ) : viewMode === 'validate' ? (
              <div className="border border-black p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">
                    {validateJson(leftInput) ? '✅' : '❌'}
                  </div>
                  <div className="text-lg font-semibold">
                    {validateJson(leftInput) ? 'JSON hợp lệ!' : 'JSON không hợp lệ!'}
                  </div>
                </div>
              </div>
            ) : (
              <JsonViewWrapper
                value={rightInput}
                onChange={setRightInput}
                placeholder="Kết quả sẽ hiển thị ở đây..."
              />
            )}
          </div>
        </div>

        {/* Third Panel - Diff Result (only in diff mode) */}
        {viewMode === 'diff' && (
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">Diff Result</label>
              <div className="flex items-center gap-2">
                <button
                  className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                  onClick={() => handleCopy(rightInput)}
                  disabled={!rightInput.trim()}
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                  onClick={() => handleDownload(rightInput, 'diff-result.json')}
                  disabled={!rightInput.trim()}
                >
                  💾 Download
                </button>
              </div>
            </div>
            <div className="flex-1">
              <JsonViewWrapper
                value={rightInput}
                onChange={setRightInput}
                placeholder="Kết quả so sánh sẽ hiển thị ở đây..."
                readOnly={true}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Panel ở giữa */}

    </div>
  );

};

export default JsonViewerPage;
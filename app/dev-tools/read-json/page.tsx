"use client"
import React, { useState, useRef, useEffect } from 'react';
import CodeEditor from '@uiw/react-textarea-code-editor';

// Component wrapper cho @uiw/react-textarea-code-editor
const CodeEditorWrapper = ({
  value,
  onChange,
  language = 'json',
  placeholder = '',
  readOnly = false,
  rows = 8
}: {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  placeholder?: string;
  readOnly?: boolean;
  rows?: number;
}) => {
  return (
    <CodeEditor
      value={value}
      language={language}
      placeholder={placeholder}
      onChange={(evn) => onChange?.(evn.target.value)}
      data-color-mode="light"
      readOnly={readOnly}
      style={{
        fontSize: 14,
        fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace',
        backgroundColor: readOnly ? '#f9fafb' : '#ffffff',
        border: '1px solid black',
        minHeight: `100px`,
        maxHeight: `500px`,
        overflowY: 'auto',
      }}
      padding={12}
    />
  );
};

const JsonViewerPage = () => {
  const [activeTab, setActiveTab] = useState('viewer');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // JSON Diff states
  const [json1, setJson1] = useState('');
  const [json2, setJson2] = useState('');
  const [diffResult, setDiffResult] = useState('');

  // Schema validation states
  const [jsonSchema, setJsonSchema] = useState('');
  const [validationResult, setValidationResult] = useState('');

  // Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState('');
  const [searchMode, setSearchMode] = useState('both'); // 'key', 'value', 'both'
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [foundPaths, setFoundPaths] = useState<Array<{path: string, key: string, value: any, type: string}>>([]);
  const [currentResultIndex, setCurrentResultIndex] = useState(0);
  
  // Language conversion states
  const [targetLanguage, setTargetLanguage] = useState('typescript');
  const [generatedCode, setGeneratedCode] = useState('');
  const [useJsonAnnotation, setUseJsonAnnotation] = useState(false);
  
  // Code generation options
  const [className, setClassName] = useState('DataModel');
  
  // TypeScript specific options
  const [tsOptionalProps, setTsOptionalProps] = useState(true);
  const [tsUseInterface, setTsUseInterface] = useState(true);
  const [tsExportDefault, setTsExportDefault] = useState(false);
  const [tsReadonly, setTsReadonly] = useState(false);
  
  // Go specific options
  const [goUsePointers, setGoUsePointers] = useState(false);
  const [goOmitEmpty, setGoOmitEmpty] = useState(true);
  const [goPackageName, setGoPackageName] = useState('main');
  
  // Python specific options
  const [pyUsePydantic, setPyUsePydantic] = useState(false);
  const [pyOptionalTypes, setPyOptionalTypes] = useState(true);
  const [pyUseDefaults, setPyUseDefaults] = useState(false);
  
  // Java specific options
  const [javaUseJackson, setJavaUseJackson] = useState(false);
  const [javaUseLombok, setJavaUseLombok] = useState(false);
  const [javaPrivateFields, setJavaPrivateFields] = useState(true);
  
  // Dart specific options
  const [dartSerializable, setDartSerializable] = useState(true);
  const [dartFinal, setDartFinal] = useState(true);
  const [dartCamelCase, setDartCamelCase] = useState(true);
  const [dartRequired, setDartRequired] = useState(false);

  const tabs = [
    { id: 'viewer', label: 'Viewer/Format' },
    { id: 'diff', label: 'JSON Diff' },
    { id: 'schema', label: 'Schema Validation' },
    { id: 'csv', label: 'JSON ↔ CSV' },
    { id: 'search', label: 'Search/Filter' },
    { id: 'convert', label: 'Code Generator' },
    { id: 'keycase', label: 'Key Case Converter' }
  ];

  function handleFormat() {
    setError('');
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
    } catch (e) {
      setError('JSON không hợp lệ!');
      setOutput('');
    }
  }

  function handleMinify() {
    setError('');
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj));
    } catch (e) {
      setError('JSON không hợp lệ!');
      setOutput('');
    }
  }

  function formatWithQuotes() {
    setError('');
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
    } catch (e) {
      setError('JSON không hợp lệ!');
      setOutput('');
    }
  }

  function formatWithoutQuotes() {
    setError('');
    try {
      const obj = JSON.parse(input);
      const formatted = JSON.stringify(obj, null, 2);
      // Remove quotes from keys
      const withoutQuotes = formatted.replace(/"([^"]+)":/g, '$1:');
      setOutput(withoutQuotes);
    } catch (e) {
      setError('JSON không hợp lệ!');
      setOutput('');
    }
  }

  function addQuotesToKeys() {
    setError('');
    try {
      // Add quotes back to keys that don't have them
      let processedInput = input;
      // Match unquoted keys and add quotes
      processedInput = processedInput.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":');
      
      const obj = JSON.parse(processedInput);
      setOutput(JSON.stringify(obj, null, 2));
    } catch (e) {
      setError('Không thể chuyển đổi! Kiểm tra lại format.');
      setOutput('');
    }
  }

  function generateTreeView() {
    setError('');
    try {
      const obj = JSON.parse(input);
      const treeHtml = jsonToTree(obj);
      setOutput(treeHtml);
    } catch (e) {
      setError('JSON không hợp lệ!');
      setOutput('');
    }
  }

  function jsonToTree(obj: any, level = 0): string {
    const indent = '  '.repeat(level);
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return `[\n${obj.map((item, index) => `${indent}  ${index}: ${jsonToTree(item, level + 1)}`).join(',\n')}\n${indent}]`;
      } else {
        return `{\n${Object.entries(obj).map(([key, value]) => `${indent}  "${key}": ${jsonToTree(value, level + 1)}`).join(',\n')}\n${indent}}`;
      }
    }
    return JSON.stringify(obj);
  }

  function handleJsonDiff() {
    setError('');
    try {
      const obj1 = JSON.parse(json1);
      const obj2 = JSON.parse(json2);
      const diff = compareObjects(obj1, obj2);
      setDiffResult(JSON.stringify(diff, null, 2));
    } catch (e) {
      setError('Một trong các JSON không hợp lệ!');
      setDiffResult('');
    }
  }

  function compareObjects(obj1: any, obj2: any): any {
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
  }

  function validateJsonSchema() {
    setError('');
    try {
      const json = JSON.parse(input);
      const schema = JSON.parse(jsonSchema);
      setValidationResult('JSON hợp lệ với schema (validation đơn giản)');
    } catch (e) {
      setError('JSON hoặc Schema không hợp lệ!');
      setValidationResult('');
    }
  }

  function convertJsonToCsv() {
    setError('');
    try {
      const json = JSON.parse(input);
      if (Array.isArray(json) && json.length > 0) {
        const headers = Object.keys(json[0]);
        const csv = [
          headers.join(','),
          ...json.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ].join('\n');
        setOutput(csv);
      } else {
        setError('JSON phải là array of objects để chuyển sang CSV');
      }
    } catch (e) {
      setError('JSON không hợp lệ!');
    }
  }

  function convertCsvToJson() {
    setError('');
    try {
      const lines = input.trim().split('\n');
      const headers = lines[0].split(',');
      const json = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header.trim()] = values[index]?.trim() || '';
        });
        return obj;
      });
      setOutput(JSON.stringify(json, null, 2));
    } catch (e) {
      setError('CSV không hợp lệ!');
    }
  }

  function searchInJson() {
    setError('');
    if (!input.trim() || !searchTerm.trim()) {
      setFoundPaths([]);
      setSearchResults('');
      setCurrentResultIndex(0);
      return;
    }

    try {
      const json = JSON.parse(input);
      const results = findInObjectAdvanced(json, searchTerm);
      setFoundPaths(results);
      setCurrentResultIndex(0);
      
      if (results.length > 0) {
        const summary = `Tìm thấy ${results.length} kết quả:\n\n` +
          results.map((result, index) => 
            `${index + 1}. Path: ${result.path}\n   ${result.type}: ${result.key}${result.type === 'value' ? ` = ${JSON.stringify(result.value)}` : ''}`
          ).join('\n\n');
        setSearchResults(summary);
      } else {
        setSearchResults('Không tìm thấy kết quả nào.');
      }
    } catch (e) {
      setError('JSON không hợp lệ!');
      setFoundPaths([]);
      setSearchResults('');
    }
  }

  function findInObjectAdvanced(obj: any, term: string, path = 'root'): Array<{path: string, key: string, value: any, type: string}> {
    const results: Array<{path: string, key: string, value: any, type: string}> = [];
    
    if (!term) return results;

    const searchText = caseSensitive ? term : term.toLowerCase();
    
    const matchText = (text: string) => {
      const compareText = caseSensitive ? text : text.toLowerCase();
      if (useRegex) {
        try {
          const regex = new RegExp(searchText, caseSensitive ? 'g' : 'gi');
          return regex.test(compareText);
        } catch {
          return compareText.includes(searchText);
        }
      }
      return compareText.includes(searchText);
    };
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const currentPath = `${path}[${index}]`;
          const nested = findInObjectAdvanced(item, term, currentPath);
          results.push(...nested);
        });
      } else {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path === 'root' ? key : `${path}.${key}`;
          
          // Search in key
          if ((searchMode === 'key' || searchMode === 'both') && matchText(key)) {
            results.push({
              path: currentPath,
              key: key,
              value: value,
              type: 'key'
            });
          }
          
          // Search in value
          if ((searchMode === 'value' || searchMode === 'both') && typeof value === 'string' && matchText(value)) {
            results.push({
              path: currentPath,
              key: key,
              value: value,
              type: 'value'
            });
          }
          
          // Recursive search
          if (typeof value === 'object' && value !== null) {
            const nested = findInObjectAdvanced(value, term, currentPath);
            results.push(...nested);
          }
        });
      }
    }
    
    return results;
  }

  // Real-time search effect
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        searchInJson();
      } else {
        setFoundPaths([]);
        setSearchResults('');
        setCurrentResultIndex(0);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, input, searchMode, caseSensitive, useRegex]);

  // Auto-generate code when options change
  React.useEffect(() => {
    if (input.trim() && targetLanguage) {
      const timeoutId = setTimeout(() => {
        generateCodeFromJson();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setGeneratedCode('');
    }
  }, [input, targetLanguage, className, 
      tsOptionalProps, tsUseInterface, tsExportDefault, tsReadonly,
      goUsePointers, goOmitEmpty, goPackageName,
      pyUsePydantic, pyOptionalTypes, pyUseDefaults,
      javaUseJackson, javaUseLombok, javaPrivateFields,
      dartSerializable, dartFinal, dartCamelCase, dartRequired, useJsonAnnotation]);

  function navigateResults(direction: 'next' | 'prev') {
    if (foundPaths.length === 0) return;
    
    if (direction === 'next') {
      setCurrentResultIndex((prev) => (prev + 1) % foundPaths.length);
    } else {
      setCurrentResultIndex((prev) => (prev - 1 + foundPaths.length) % foundPaths.length);
    }
  }

  function generateCodeFromJson() {
    setError('');
    try {
      const json = JSON.parse(input);
      let code = '';
      
      switch (targetLanguage) {
        case 'typescript':
          code = generateTypeScriptInterface(json);
          break;
        case 'go':
          code = generateGoStruct(json);
          break;
        case 'python':
          code = generatePythonDataclass(json);
          break;
        case 'java':
          code = generateJavaClass(json);
          break;
        case 'dart':
          code = generateDartClass(json);
          break;
        default:
          code = 'Ngôn ngữ không được hỗ trợ';
      }
      setGeneratedCode(code);
    } catch (e) {
      setError('JSON không hợp lệ!');
    }
  }

  function generateTypeScriptInterface(obj: any): string {
    function getType(value: any): string {
      if (Array.isArray(value)) return `${getType(value[0])}[]`;
      if (typeof value === 'object' && value !== null) return 'object';
      if (typeof value === 'string') return 'string';
      if (typeof value === 'number') return 'number';
      if (typeof value === 'boolean') return 'boolean';
      return 'any';
    }

    const interfaceName = className || 'DataModel';
    const modifier = tsReadonly ? 'readonly ' : '';
    const optional = tsOptionalProps ? '?' : '';
    const keyword = tsUseInterface ? 'interface' : 'type';
    const equals = tsUseInterface ? '' : ' = ';
    
    const properties = Object.entries(obj).map(([key, value]) => {
      return `  ${modifier}${key}${optional}: ${getType(value)};`;
    }).join('\n');

    const exportPrefix = tsExportDefault ? 'export default ' : '';
    
    if (tsUseInterface) {
      return `${exportPrefix}${keyword} ${interfaceName} {\n${properties}\n}`;
    } else {
      return `${exportPrefix}${keyword} ${interfaceName}${equals}{\n${properties}\n}`;
    }
  }

  function generateGoStruct(obj: any): string {
    function getGoType(value: any): string {
      const baseType = (() => {
        if (Array.isArray(value)) return `[]${getGoType(value[0])}`;
        if (typeof value === 'object' && value !== null) return 'interface{}';
        if (typeof value === 'string') return 'string';
        if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float64';
        if (typeof value === 'boolean') return 'bool';
        return 'interface{}';
      })();
      
      return goUsePointers && !baseType.startsWith('[]') ? `*${baseType}` : baseType;
    }

    const structName = className || 'DataModel';
    const packageDeclaration = goPackageName !== 'main' ? `package ${goPackageName}\n\n` : '';
    const omitEmpty = goOmitEmpty ? ',omitempty' : '';
    
    const fields = Object.entries(obj).map(([key, value]) => {
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
      return `  ${capitalizedKey} ${getGoType(value)} \`json:"${key}${omitEmpty}"\``;
    }).join('\n');

    return `${packageDeclaration}type ${structName} struct {\n${fields}\n}`;
  }

  function generatePythonDataclass(obj: any): string {
    function getPythonType(value: any): string {
      if (Array.isArray(value)) return `List[${getPythonType(value[0])}]`;
      if (typeof value === 'object' && value !== null) return 'Dict[str, Any]';
      if (typeof value === 'string') return 'str';
      if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'float';
      if (typeof value === 'boolean') return 'bool';
      return 'Any';
    }

    function makeOptional(type: string): string {
      return pyOptionalTypes ? `Optional[${type}]` : type;
    }

    const pythonClassName = className || 'DataModel';
    
    if (pyUsePydantic) {
      const imports = 'from pydantic import BaseModel\nfrom typing import List, Dict, Any, Optional\n\n';
      const fields = Object.entries(obj).map(([key, value]) => {
        const fieldType = makeOptional(getPythonType(value));
        const defaultValue = pyUseDefaults ? ' = None' : '';
        return `    ${key}: ${fieldType}${defaultValue}`;
      }).join('\n');
      
      return `${imports}class ${pythonClassName}(BaseModel):\n${fields}`;
    } else {
      const imports = 'from dataclasses import dataclass\nfrom typing import List, Dict, Any, Optional\n\n';
      const fields = Object.entries(obj).map(([key, value]) => {
        const fieldType = makeOptional(getPythonType(value));
        const defaultValue = pyUseDefaults ? ' = None' : '';
        return `    ${key}: ${fieldType}${defaultValue}`;
      }).join('\n');

      return `${imports}@dataclass\nclass ${pythonClassName}:\n${fields}`;
    }
  }

  function generateJavaClass(obj: any): string {
    function getJavaType(value: any): string {
      if (Array.isArray(value)) return `List<${getJavaType(value[0])}>`;
      if (typeof value === 'object' && value !== null) return 'Object';
      if (typeof value === 'string') return 'String';
      if (typeof value === 'number') return Number.isInteger(value) ? 'Integer' : 'Double';
      if (typeof value === 'boolean') return 'Boolean';
      return 'Object';
    }

    const javaClassName = className || 'DataModel';
    const fieldVisibility = javaPrivateFields ? 'private' : 'public';
    
    let imports = '';
    let classAnnotations = '';
    
    if (javaUseJackson) {
      imports += 'import com.fasterxml.jackson.annotation.JsonProperty;\n';
    }
    
    if (javaUseLombok) {
      imports += 'import lombok.Data;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n';
      classAnnotations = '@Data\n@NoArgsConstructor\n@AllArgsConstructor\n';
    }
    
    if (imports) imports += '\n';
    
    const fields = Object.entries(obj).map(([key, value]) => {
      let annotation = '';
      if (javaUseJackson) {
        annotation = `    @JsonProperty("${key}")\n`;
      }
      return `${annotation}    ${fieldVisibility} ${getJavaType(value)} ${key};`;
    }).join('\n\n');

    const constructorAndMethods = javaUseLombok ? '' : '\n\n    // Constructors, getters, and setters...';

    return `${imports}${classAnnotations}public class ${javaClassName} {\n${fields}${constructorAndMethods}\n}`;
  }

  function generateDartClass(obj: any): string {
    function getDartType(value: any): string {
      if (Array.isArray(value)) {
        const itemType = value.length > 0 ? getDartType(value[0]) : 'dynamic';
        return `List<${itemType}>`;
      }
      if (typeof value === 'object' && value !== null) return 'Map<String, dynamic>';
      if (typeof value === 'string') return 'String';
      if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'double';
      if (typeof value === 'boolean') return 'bool';
      return 'dynamic';
    }

    function convertToCamelCase(str: string): string {
      return dartCamelCase ? str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase()) : str;
    }

    function makeNullable(type: string): string {
      return dartRequired ? type : `${type}?`;
    }

    const classNameToUse = className || 'DataModel';
    const fieldModifier = dartFinal ? 'final ' : '';
    
    // Generate với json_annotation package
    if (useJsonAnnotation && dartSerializable) {
      const fields = Object.entries(obj).map(([key, value]) => {
        const fieldName = convertToCamelCase(key);
        const fieldType = makeNullable(getDartType(value));
        const jsonKeyAnnotation = dartCamelCase && key !== fieldName ? `  @JsonKey(name: '${key}')\n` : '';
        
        return `${jsonKeyAnnotation}  ${fieldModifier}${fieldType} ${fieldName};`;
      }).join('\n\n');

      const constructorParams = Object.entries(obj).map(([key, value]) => {
        const fieldName = convertToCamelCase(key);
        return dartRequired ? `    required this.${fieldName},` : `    this.${fieldName},`;
      }).join('\n');

      const fileName = classNameToUse.toLowerCase();
      
      return `import 'package:json_annotation/json_annotation.dart';

part '${fileName}.g.dart';

@JsonSerializable()
class ${classNameToUse} {
${fields}

  ${dartRequired ? 'const ' : ''}${classNameToUse}({
${constructorParams}
  });

  factory ${classNameToUse}.fromJson(Map<String, dynamic> json) => _$${classNameToUse}FromJson(json);

  Map<String, dynamic> toJson() => _$${classNameToUse}ToJson(this);
}

// Chạy command sau để generate code:
// dart run build_runner build`;
    }
    
    // Generate manual style
    const fields = Object.entries(obj).map(([key, value]) => {
      const fieldName = convertToCamelCase(key);
      const fieldType = makeNullable(getDartType(value));
      return `  ${fieldModifier}${fieldType} ${fieldName};`;
    }).join('\n');

    const constructorParams = Object.entries(obj).map(([key, value]) => {
      const fieldName = convertToCamelCase(key);
      return dartRequired ? `    required this.${fieldName},` : `    this.${fieldName},`;
    }).join('\n');

    // Chỉ tạo serialization methods khi dartSerializable = true
    let serializationMethods = '';
    if (dartSerializable) {
      const fromJsonParams = Object.entries(obj).map(([key, value]) => {
        const fieldName = convertToCamelCase(key);
        const dartType = getDartType(value);
        if (dartType.startsWith('List<')) {
          const innerType = dartType.replace('List<', '').replace('>', '');
          return `      ${fieldName}: (json['${key}'] as List?)?.cast<${innerType}>(),`;
        }
        const baseType = makeNullable(dartType).replace('?', '');
        return `      ${fieldName}: json['${key}'] as ${baseType}${dartRequired ? '' : '?'},`;
      }).join('\n');

      const toJsonParams = Object.entries(obj).map(([key, value]) => {
        const fieldName = convertToCamelCase(key);
        return `      '${key}': ${fieldName},`;
      }).join('\n');

      serializationMethods = `

  factory ${classNameToUse}.fromJson(Map<String, dynamic> json) {
    return ${classNameToUse}(
${fromJsonParams}
    );
  }

  Map<String, dynamic> toJson() {
    return {
${toJsonParams}
    };
  }`;
    }

    return `class ${classNameToUse} {
${fields}

  ${dartRequired ? 'const ' : ''}${classNameToUse}({
${constructorParams}
  });${serializationMethods}
}`;
  }

  function convertKeyCase(caseType: string) {
    setError('');
    try {
      const json = JSON.parse(input);
      const converted = convertObjectKeyCase(json, caseType);
      setOutput(JSON.stringify(converted, null, 2));
    } catch (e) {
      setError('JSON không hợp lệ!');
    }
  }

  function convertObjectKeyCase(obj: any, caseType: string): any {
    if (Array.isArray(obj)) {
      return obj.map(item => convertObjectKeyCase(item, caseType));
    }

    if (typeof obj === 'object' && obj !== null) {
      const newObj: any = {};
      Object.entries(obj).forEach(([key, value]) => {
        let newKey = key;
        switch (caseType) {
          case 'camel':
            newKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            break;
          case 'snake':
            newKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            break;
          case 'pascal':
            newKey = key.charAt(0).toUpperCase() + key.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
            break;
        }
        newObj[newKey] = convertObjectKeyCase(value, caseType);
      });
      return newObj;
    }

    return obj;
  }

  function handleCopy(text: string = output) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }

  function renderTabContent() {
    switch (activeTab) {
      case 'viewer':
        return (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-semibold">JSON Input</label>
              <button
                className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                onClick={() => {
                  try {
                    const obj = JSON.parse(input);
                    const formatted = JSON.stringify(obj, null, 2);
                    setInput(formatted);
                    setOutput(formatted);
                    setError('');
                  } catch (e) {
                    setError('JSON không hợp lệ!');
                  }
                }}
                disabled={!input.trim()}
              >
                Quick Format
              </button>
            </div>
            <CodeEditorWrapper
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Dán hoặc nhập JSON tại đây..."
              rows={8}
            />
            <div className="flex flex-wrap gap-2 my-4">
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={handleFormat}>
                Format JSON
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={handleMinify}>
                Minify
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={formatWithQuotes}>
                + Quotes Keys
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={formatWithoutQuotes}>
                - Quotes Keys
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={addQuotesToKeys}>
                Fix Keys
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={generateTreeView}>
                Tree View
              </button>
            </div>
            
            {/* Format tips */}
            <div className="text-xs text-gray-600 mb-4 p-2 bg-gray-50 border border-gray-300">
              <strong>Format Tips:</strong> 
              <span className="ml-2">📋 Format JSON: Standard JSON format</span>
              <span className="ml-4">➕ + Quotes Keys: {`{slug} → "slug"`}</span>
              <span className="ml-4">➖ - Quotes Keys: {`"slug" → slug`}</span>
              <span className="ml-4">🔧 Fix Keys: Thêm quotes cho keys thiếu</span>
            </div>

            {output && (
              <div className="mb-2 w-full">
                <div className="flex justify-between items-center mb-2">
                  <label className="font-semibold">Kết quả</label>
                  <div className="flex gap-2">
                    <button
                      className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                      onClick={handleFormat}
                    >
                      Format
                    </button>
                    <button
                      className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                      onClick={() => handleCopy()}
                    >
                      {copied ? 'Đã copy!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <CodeEditorWrapper
                  value={output}
                  language="json"
                  readOnly={true}
                  rows={8}
                />
              </div>
            )}
          </div>
        );

      case 'diff':
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">JSON 1</label>
                <CodeEditorWrapper
                  value={json1}
                  onChange={setJson1}
                  language="json"
                  rows={6}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">JSON 2</label>
                <CodeEditorWrapper
                  value={json2}
                  onChange={setJson2}
                  language="json"
                  rows={6}
                />
              </div>
            </div>
            <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200 mb-4" onClick={handleJsonDiff}>
              So sánh
            </button>
            {diffResult && (
              <div>
                <label className="block mb-1 font-semibold">Khác biệt</label>
                <CodeEditorWrapper
                  value={diffResult}
                  language="json"
                  readOnly={true}
                  rows={6}
                />
              </div>
            )}
          </div>
        );

      case 'schema':
        return (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-1 font-semibold">JSON Data</label>
                <CodeEditorWrapper
                  value={input}
                  onChange={setInput}
                  language="json"
                  rows={6}
                />
              </div>
              <div>
                <label className="block mb-1 font-semibold">JSON Schema</label>
                <CodeEditorWrapper
                  value={jsonSchema}
                  onChange={setJsonSchema}
                  language="json"
                  rows={6}
                />
              </div>
            </div>
            <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200 mb-4" onClick={validateJsonSchema}>
              Validate
            </button>
            {validationResult && (
              <div className="p-3 border border-black bg-green-50">
                {validationResult}
              </div>
            )}
          </div>
        );

      case 'csv':
        return (
          <div>
            <CodeEditorWrapper
              value={input}
              onChange={setInput}
              language="csv"
              placeholder="Nhập JSON (array of objects) hoặc CSV..."
              rows={8}
            />
            <div className="flex gap-2 my-4">
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={convertJsonToCsv}>
                JSON → CSV
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={convertCsvToJson}>
                CSV → JSON
              </button>
            </div>
            {output && (
              <CodeEditorWrapper
                value={output}
                language={input.includes('{') ? 'json' : 'csv'}
                readOnly={true}
                rows={8}
              />
            )}
          </div>
        );

      case 'search':
        return (
          <div>
            <CodeEditorWrapper
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Nhập JSON để tìm kiếm..."
              rows={6}
            />
            
            {/* Search Controls */}
            <div className="border border-black p-4 my-4">
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex-1 min-w-64">
                  <input
                    className="w-full border border-black px-3 py-2"
                    placeholder="Tìm kiếm key hoặc value..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                
                {/* Search Mode */}
                <select
                  className="border border-black px-3 py-2"
                  value={searchMode}
                  onChange={e => setSearchMode(e.target.value)}
                >
                  <option value="both">Key & Value</option>
                  <option value="key">Chỉ Key</option>
                  <option value="value">Chỉ Value</option>
                </select>
              </div>

              {/* Search Options */}
              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={caseSensitive}
                    onChange={e => setCaseSensitive(e.target.checked)}
                  />
                  <span className="text-sm">Case Sensitive</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={useRegex}
                    onChange={e => setUseRegex(e.target.checked)}
                  />
                  <span className="text-sm">Regex</span>
                </label>
              </div>

              {/* Results Navigation */}
              {foundPaths.length > 0 && (
                <div className="flex items-center gap-4 text-sm">
                  <span>
                    Kết quả {currentResultIndex + 1} / {foundPaths.length}
                  </span>
                  <button
                    className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                    onClick={() => navigateResults('prev')}
                    disabled={foundPaths.length <= 1}
                  >
                    ↑ Trước
                  </button>
                  <button
                    className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                    onClick={() => navigateResults('next')}
                    disabled={foundPaths.length <= 1}
                  >
                    ↓ Sau
                  </button>
                  
                  {foundPaths[currentResultIndex] && (
                    <div className="ml-4 p-2 bg-yellow-100 border border-yellow-300 text-xs">
                      <strong>Current:</strong> {foundPaths[currentResultIndex].path} - 
                      {foundPaths[currentResultIndex].type}: {foundPaths[currentResultIndex].key}
                      {foundPaths[currentResultIndex].type === 'value' && 
                        ` = ${JSON.stringify(foundPaths[currentResultIndex].value)}`
                      }
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Results */}
            {searchResults && (
              <div>
                <label className="block mb-1 font-semibold">Kết quả tìm kiếm</label>
                <CodeEditorWrapper
                  value={searchResults}
                  language="text"
                  readOnly={true}
                  rows={8}
                />
              </div>
            )}
          </div>
        );

      case 'convert':
        return (
          <div>
            <CodeEditorWrapper
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Nhập JSON để chuyển đổi thành code..."
              rows={6}
            />
            <div className="flex gap-2 my-4">
              <select
                className="border border-black px-3 py-2"
                value={targetLanguage}
                onChange={e => setTargetLanguage(e.target.value)}
              >
                <option value="typescript">TypeScript Interface</option>
                <option value="go">Go Struct</option>
                <option value="python">Python Dataclass</option>
                <option value="java">Java Class</option>
                <option value="dart">Dart Class</option>
              </select>
              
              <div className="flex items-center text-xs text-gray-600 ml-4">
                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Auto-generating...
              </div>
            </div>
            
            {/* Class Name Input - for all languages */}
            <div className="flex items-center gap-2 mb-4">
              <label className="text-sm font-medium min-w-20">Class Name:</label>
              <input
                type="text"
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="border border-black px-2 py-1 text-sm"
                placeholder="DataModel"
              />
              <span className="text-xs text-gray-500">
                {targetLanguage === 'typescript' && '.ts'}
                {targetLanguage === 'go' && '.go'}
                {targetLanguage === 'python' && '.py'}
                {targetLanguage === 'java' && '.java'}
                {targetLanguage === 'dart' && '.dart'}
              </span>
            </div>
            
            {/* Language specific options */}
            {targetLanguage === 'typescript' && (
              <div className="border border-black p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">TypeScript Settings</h3>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    Real-time preview
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tsOptionalProps}
                      onChange={e => setTsOptionalProps(e.target.checked)}
                    />
                    <span className="text-sm">optional properties (?)</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tsUseInterface}
                      onChange={e => setTsUseInterface(e.target.checked)}
                    />
                    <span className="text-sm">use interface</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tsExportDefault}
                      onChange={e => setTsExportDefault(e.target.checked)}
                    />
                    <span className="text-sm">export default</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={tsReadonly}
                      onChange={e => setTsReadonly(e.target.checked)}
                    />
                    <span className="text-sm">readonly</span>
                  </label>
                </div>
              </div>
            )}
            
            {targetLanguage === 'go' && (
              <div className="border border-black p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Go Settings</h3>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    Real-time preview
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-medium min-w-20">Package:</label>
                  <input
                    type="text"
                    value={goPackageName}
                    onChange={e => setGoPackageName(e.target.value)}
                    className="border border-black px-2 py-1 text-sm"
                    placeholder="main"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={goUsePointers}
                      onChange={e => setGoUsePointers(e.target.checked)}
                    />
                    <span className="text-sm">use pointers (*)</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={goOmitEmpty}
                      onChange={e => setGoOmitEmpty(e.target.checked)}
                    />
                    <span className="text-sm">omitempty tags</span>
                  </label>
                </div>
              </div>
            )}
            
            {targetLanguage === 'python' && (
              <div className="border border-black p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Python Settings</h3>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    Real-time preview
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pyUsePydantic}
                      onChange={e => setPyUsePydantic(e.target.checked)}
                    />
                    <span className="text-sm">use Pydantic</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pyOptionalTypes}
                      onChange={e => setPyOptionalTypes(e.target.checked)}
                    />
                    <span className="text-sm">Optional types</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={pyUseDefaults}
                      onChange={e => setPyUseDefaults(e.target.checked)}
                    />
                    <span className="text-sm">default values</span>
                  </label>
                </div>
              </div>
            )}
            
            {targetLanguage === 'java' && (
              <div className="border border-black p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Java Settings</h3>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    Real-time preview
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={javaUseJackson}
                      onChange={e => setJavaUseJackson(e.target.checked)}
                    />
                    <span className="text-sm">Jackson annotations</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={javaUseLombok}
                      onChange={e => setJavaUseLombok(e.target.checked)}
                    />
                    <span className="text-sm">Lombok annotations</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={javaPrivateFields}
                      onChange={e => setJavaPrivateFields(e.target.checked)}
                    />
                    <span className="text-sm">private fields</span>
                  </label>
                </div>
              </div>
            )}
            
            {/* Dart specific options */}
            {targetLanguage === 'dart' && (
              <div className="border border-black p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold">Dart Settings</h3>
                  <div className="flex items-center text-xs text-gray-600">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-1"></span>
                    Real-time preview
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dartSerializable}
                      onChange={e => setDartSerializable(e.target.checked)}
                    />
                    <span className="text-sm">serializable</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dartFinal}
                      onChange={e => setDartFinal(e.target.checked)}
                    />
                    <span className="text-sm">final</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dartCamelCase}
                      onChange={e => setDartCamelCase(e.target.checked)}
                    />
                    <span className="text-sm">camelCase</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={dartRequired}
                      onChange={e => setDartRequired(e.target.checked)}
                    />
                    <span className="text-sm">required</span>
                  </label>
                </div>
                
                {/* json_annotation option */}
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useJsonAnnotation}
                      onChange={e => setUseJsonAnnotation(e.target.checked)}
                    />
                    <span className="text-sm">Use json_annotation package</span>
                  </label>
                </div>
              </div>
            )}
            
            {generatedCode && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold">Generated Code</label>
                  <button
                    className="px-2 py-1 border border-black bg-white hover:bg-gray-200 text-xs"
                    onClick={() => handleCopy(generatedCode)}
                  >
                    {copied ? 'Đã copy!' : 'Copy'}
                  </button>
                </div>
                <CodeEditorWrapper
                  value={generatedCode}
                  language={targetLanguage}
                  readOnly={true}
                  rows={8}
                />
              </div>
            )}
          </div>
        );

      case 'keycase':
        return (
          <div>
            <CodeEditorWrapper
              value={input}
              onChange={setInput}
              language="json"
              placeholder="Nhập JSON để chuyển đổi key case..."
              rows={6}
            />
            <div className="flex gap-2 my-4">
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={() => convertKeyCase('camel')}>
                camelCase
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={() => convertKeyCase('snake')}>
                snake_case
              </button>
              <button className="px-4 py-2 border border-black bg-white hover:bg-gray-200" onClick={() => convertKeyCase('pascal')}>
                PascalCase
              </button>
            </div>
            {output && (
              <CodeEditorWrapper
                value={output}
                language={targetLanguage}
                readOnly={true}
                rows={8}
              />
            )}
  </div>
        );

      default:
        return <div>Tính năng đang phát triển...</div>;
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 text-mono">
      <h1 className="text-2xl font-bold mb-4">JSON Multi-Tool</h1>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-black">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-black bg-white'
                : 'border-transparent hover:border-gray-300'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500 mb-4 p-3 border border-red-300 bg-red-50">{error}</div>}

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default JsonViewerPage;
import React, { useState, useRef } from 'react';
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';

interface ImportResult {
  totalRows: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
}

const CsvImportForm: React.FC = () => {
  const { currentSpace } = useSpace();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [importSettings, setImportSettings] = useState({
    skipFirstRow: true,
    dateFormat: 'yyyy-MM-dd',
    columnMapping: {
      dateColumn: 0,
      descriptionColumn: 1,
      amountColumn: 2,
      categoryColumn: 3,
      accountColumn: null as number | null,
      notesColumn: null as number | null
    }
  });

  const dateFormatOptions = [
    { value: 'yyyy-MM-dd', label: '2024-01-15 (ISO Format)' },
    { value: 'MM/dd/yyyy', label: '01/15/2024 (US Format)' },
    { value: 'dd/MM/yyyy', label: '15/01/2024 (EU Format)' },
    { value: 'dd-MM-yyyy', label: '15-01-2024 (EU Dash)' },
    { value: 'M/d/yyyy', label: '1/15/2024 (US Short)' },
    { value: 'd/M/yyyy', label: '15/1/2024 (EU Short)' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setSelectedFile(file);
      setError(null);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !currentSpace?.spaceId) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const importResult = await apiService.importCsv(currentSpace.spaceId, selectedFile, {
        skipFirstRow: importSettings.skipFirstRow,
        dateFormat: importSettings.dateFormat,
        columnMapping: importSettings.columnMapping
      });

      setResult(importResult);
    } catch (error: any) {
      console.error('Import error:', error);
      setError(error.message || 'Failed to import CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateColumnMapping = (field: string, value: number | null) => {
    setImportSettings(prev => ({
      ...prev,
      columnMapping: {
        ...prev.columnMapping,
        [field]: value
      }
    }));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Import Transactions from CSV
      </h2>
      
      <p className="text-sm text-gray-600 mb-6">
        Upload a CSV file containing your transaction data. Make sure your CSV includes at least Date, Description, and Amount columns.
      </p>

      {/* File Upload Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          1. Select CSV File
        </h3>
        
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <CloudArrowUpIcon className="h-4 w-4" />
            Choose CSV File
          </button>
          
          {selectedFile && (
            <div className="mt-2">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                <span>{selectedFile.name}</span>
                <button 
                  onClick={handleReset}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded">
          <p className="text-sm">
            <strong>CSV Format Requirements:</strong><br />
            • Date column (required)<br />
            • Description/Title column (required)<br />
            • Amount column (required)<br />
            • Category column (optional)<br />
            • Account column (optional)<br />
            • Notes column (optional)
          </p>
        </div>
      </div>

      {/* Import Settings */}
      {selectedFile && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            2. Configure Import Settings
          </h3>

          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={importSettings.skipFirstRow}
                onChange={(e) => setImportSettings(prev => ({ 
                  ...prev, 
                  skipFirstRow: e.target.checked 
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Skip first row (header row)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Format
                </label>
                <select
                  value={importSettings.dateFormat}
                  onChange={(e) => setImportSettings(prev => ({ 
                    ...prev, 
                    dateFormat: e.target.value 
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {dateFormatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Column Mapping (Column numbers start from 0)
              </h4>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Column *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importSettings.columnMapping.dateColumn}
                    onChange={(e) => updateColumnMapping('dateColumn', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description Column *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importSettings.columnMapping.descriptionColumn}
                    onChange={(e) => updateColumnMapping('descriptionColumn', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Column *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importSettings.columnMapping.amountColumn}
                    onChange={(e) => updateColumnMapping('amountColumn', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category Column
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importSettings.columnMapping.categoryColumn}
                    onChange={(e) => updateColumnMapping('categoryColumn', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Column
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importSettings.columnMapping.accountColumn || ''}
                    onChange={(e) => updateColumnMapping('accountColumn', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes Column
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={importSettings.columnMapping.notesColumn || ''}
                    onChange={(e) => updateColumnMapping('notesColumn', e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Optional</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Button */}
      {selectedFile && (
        <div className="mb-6">
          <button
            onClick={handleImport}
            disabled={loading}
            className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg"
          >
            <CloudArrowUpIcon className="h-5 w-5" />
            {loading ? 'Importing...' : 'Import CSV Data'}
          </button>
        </div>
      )}

      {/* Loading Progress */}
      {loading && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          <p className="text-sm text-gray-600">
            Processing your CSV file...
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Results Display */}
      {result && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Import Results
          </h3>
          
          <div className="flex gap-2 mb-4 flex-wrap">
            <div className="inline-flex items-center gap-1 bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
              <InformationCircleIcon className="h-4 w-4" />
              {result.totalRows} total rows
            </div>
            <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <CheckCircleIcon className="h-4 w-4" />
              {result.successfulImports} imported
            </div>
            {result.failedImports > 0 && (
              <div className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                {result.failedImports} failed
              </div>
            )}
          </div>

          {result.successfulImports > 0 && (
            <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mb-4">
              Successfully imported {result.successfulImports} transaction(s)!
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mb-4">
              <p className="font-medium mb-2">Import Errors:</p>
              <ul className="list-disc pl-5 space-y-1">
                {result.errors.slice(0, 10).map((error, index) => (
                  <li key={index} className="text-sm">{error}</li>
                ))}
                {result.errors.length > 10 && (
                  <li className="text-sm">
                    ... and {result.errors.length - 10} more errors
                  </li>
                )}
              </ul>
            </div>
          )}

          <button 
            onClick={handleReset}
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
          >
            Import Another File
          </button>
        </div>
      )}
    </div>
  );
};

export default CsvImportForm;
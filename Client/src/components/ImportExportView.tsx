import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CsvImportForm from './CsvImportForm';
import DataExportForm from './DataExportForm';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index, ...other }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`import-export-tabpanel-${index}`}
      aria-labelledby={`import-export-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="p-6">
          {children}
        </div>
      )}
    </div>
  );
}

const ImportExportView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Import & Export
        </h1>
        <p className="text-gray-600">
          Import transactions from CSV files or export your financial data for backup and analysis.
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-blue-800 text-sm">
          <strong>Important:</strong> Make sure to backup your data before importing. 
          Imported transactions will be added to your existing data and cannot be easily undone.
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Import export tabs">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                tabValue === 0
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              id="import-export-tab-0"
              aria-controls="import-export-tabpanel-0"
              aria-selected={tabValue === 0}
            >
              Import Data
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                tabValue === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              id="import-export-tab-1"
              aria-controls="import-export-tabpanel-1"
              aria-selected={tabValue === 1}
            >
              Export Data
            </button>
          </nav>
        </div>

        <TabPanel value={tabValue} index={0}>
          <CsvImportForm />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <DataExportForm />
        </TabPanel>
      </div>
    </div>
  );
};

export default ImportExportView;
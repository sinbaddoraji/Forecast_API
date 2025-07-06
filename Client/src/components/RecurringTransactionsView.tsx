import React, { useState } from 'react';
import { Plus, Info } from 'lucide-react';
import RecurringExpensesList from './RecurringExpensesList';
import RecurringIncomesList from './RecurringIncomesList';
import RecurringExpenseForm from './RecurringExpenseForm';
import RecurringIncomeForm from './RecurringIncomeForm';
import { Modal } from './Modal';

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
      id={`recurring-tabpanel-${index}`}
      aria-labelledby={`recurring-tab-${index}`}
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

const RecurringTransactionsView: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showIncomeForm, setShowIncomeForm] = useState(false);

  const handleTabChange = (newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Recurring Transactions
        </h1>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-blue-800 text-sm">
          Set up recurring transactions to automatically track your regular income and expenses. 
          These will be generated automatically based on your schedule.
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Recurring transactions tabs">
            <button
              onClick={() => handleTabChange(0)}
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                tabValue === 0
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              id="recurring-tab-0"
              aria-controls="recurring-tabpanel-0"
              aria-selected={tabValue === 0}
            >
              Recurring Expenses
            </button>
            <button
              onClick={() => handleTabChange(1)}
              className={`py-4 px-6 text-sm font-medium border-b-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                tabValue === 1
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              id="recurring-tab-1"
              aria-controls="recurring-tabpanel-1"
              aria-selected={tabValue === 1}
            >
              Recurring Income
            </button>
          </nav>
        </div>

        <TabPanel value={tabValue} index={0}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recurring Expenses
            </h2>
            <button
              onClick={() => setShowExpenseForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Recurring Expense
            </button>
          </div>
          <RecurringExpensesList />
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recurring Income
            </h2>
            <button
              onClick={() => setShowIncomeForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Recurring Income
            </button>
          </div>
          <RecurringIncomesList />
        </TabPanel>
      </div>

      {/* Recurring Expense Form Modal */}
      <Modal
        show={showExpenseForm}
        onClose={() => setShowExpenseForm(false)}
        title="Add Recurring Expense"
      >
        <RecurringExpenseForm
          onSuccess={() => {
            setShowExpenseForm(false);
          }}
          onCancel={() => setShowExpenseForm(false)}
        />
      </Modal>

      {/* Recurring Income Form Modal */}
      <Modal
        show={showIncomeForm}
        onClose={() => setShowIncomeForm(false)}
        title="Add Recurring Income"
      >
        <RecurringIncomeForm
          onSuccess={() => {
            setShowIncomeForm(false);
          }}
          onCancel={() => setShowIncomeForm(false)}
        />
      </Modal>
    </div>
  );
};

export default RecurringTransactionsView;
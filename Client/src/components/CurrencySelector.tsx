import React, { useState } from 'react';
import { CheckIcon } from '@heroicons/react/24/outline';
import { Loader2 } from 'lucide-react';
import { apiService } from '../services/api';
import { useSpace } from '../contexts/SpaceContext';

interface CurrencyOption {
  code: string;
  name: string;
  symbol: string;
}

const CURRENCY_OPTIONS: CurrencyOption[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$' },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽' },
  { code: 'PLN', name: 'Polish Zloty', symbol: 'zł' }
];

const CurrencySelector: React.FC = () => {
  const { currentSpace, refreshSpaces } = useSpace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState(currentSpace?.currency || 'USD');

  const handleSave = async () => {
    if (!currentSpace?.spaceId) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updateData = {
        name: currentSpace.name,
        currency: selectedCurrency
      };

      await apiService.updateSpace(currentSpace.spaceId, updateData);
      await refreshSpaces();
      setSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error updating space currency:', error);
      setError(error.message || 'Failed to update currency');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentCurrencyInfo = () => {
    return CURRENCY_OPTIONS.find(option => option.code === (currentSpace?.currency || 'USD'));
  };

  const getSelectedCurrencyInfo = () => {
    return CURRENCY_OPTIONS.find(option => option.code === selectedCurrency);
  };

  if (!currentSpace) {
    return (
      <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded">
        No space selected. Please select a space to manage currency settings.
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Currency Settings
      </h2>
      
      <p className="text-sm text-gray-600 mb-6">
        Select the primary currency for this space. All amounts will be displayed in this currency.
      </p>

      <div className="mb-6">
        <p className="text-sm font-medium text-gray-700 mb-1">
          Current Currency
        </p>
        <p className="text-lg font-bold text-blue-600">
          {getCurrentCurrencyInfo()?.symbol} {getCurrentCurrencyInfo()?.name} ({getCurrentCurrencyInfo()?.code})
        </p>
      </div>

      <div className="mb-6">
        <label htmlFor="currency-select" className="block text-sm font-medium text-gray-700 mb-1">
          Select Currency
        </label>
        <select
          id="currency-select"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CURRENCY_OPTIONS.map((currency) => (
            <option key={currency.code} value={currency.code}>
              {currency.symbol} {currency.name} ({currency.code})
            </option>
          ))}
        </select>
      </div>

      {selectedCurrency !== currentSpace.currency && (
        <div className="bg-blue-50 border border-blue-300 text-blue-700 px-4 py-3 rounded mb-6">
          <p className="text-sm">
            <strong>Preview:</strong> Amounts will be displayed as {getSelectedCurrencyInfo()?.symbol} 
            {' '}({getSelectedCurrencyInfo()?.code}) after saving.
          </p>
        </div>
      )}

      <div className="flex gap-3 items-center">
        <button
          onClick={handleSave}
          disabled={loading || selectedCurrency === currentSpace.currency}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4" />
              Save Currency
            </>
          )}
        </button>
        
        {selectedCurrency !== currentSpace.currency && (
          <button
            onClick={() => setSelectedCurrency(currentSpace.currency)}
            disabled={loading}
            className="border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded mt-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded mt-4">
          Currency updated successfully!
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-300 text-yellow-700 px-4 py-3 rounded mt-6">
        <p className="text-sm">
          <strong>Note:</strong> Changing the currency will only affect how amounts are displayed. 
          Existing transaction amounts will not be converted automatically.
        </p>
      </div>
    </div>
  );
};

export default CurrencySelector;
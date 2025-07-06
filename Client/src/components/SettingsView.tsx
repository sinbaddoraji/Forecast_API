import React from 'react';
import { Settings, AlertCircle, Info } from 'lucide-react';
import CurrencySelector from './CurrencySelector';
import { useSpace } from '../contexts/SpaceContext';

const SettingsView: React.FC = () => {
  const { currentSpace } = useSpace();

  if (!currentSpace) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-red-800">
            No space selected. Please select a space to access settings.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6" />
          Settings
        </h1>
        <p className="text-gray-600">
          Manage your space settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <CurrencySelector />
        </div>

        <div className="md:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Space Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Space Name
                </p>
                <p className="text-gray-900">
                  {currentSpace.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Space ID
                </p>
                <p className="text-sm font-mono text-gray-700">
                  {currentSpace.spaceId}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Current Currency
                </p>
                <p className="text-gray-900">
                  {currentSpace.currency}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-1">
                  Created
                </p>
                <p className="text-sm text-gray-700">
                  {new Date(currentSpace.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-blue-800 text-sm">
            <strong>More settings coming soon:</strong> We're working on additional customization options 
            including themes, notifications, and data export preferences.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
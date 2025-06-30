import React from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { SpaceSelector } from './SpaceSelector';
import { Loader2 } from 'lucide-react';

interface SpaceGuardProps {
  children: React.ReactNode;
}

export const SpaceGuard: React.FC<SpaceGuardProps> = ({ children }) => {
  const { currentSpace, loading, error } = useSpace();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading your spaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!currentSpace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to Forecast</h2>
          <p className="text-gray-600 mb-6">
            You need to create or select a space to manage your budget. 
            Spaces help you organize your finances separately (e.g., personal, family, business).
          </p>
          <SpaceSelector />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
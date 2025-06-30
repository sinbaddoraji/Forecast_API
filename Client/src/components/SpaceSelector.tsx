import React, { useState } from 'react';
import { useSpace } from '../contexts/SpaceContext';
import { ChevronDown, Plus, Settings, Users } from 'lucide-react';

export const SpaceSelector: React.FC = () => {
  const { currentSpace, userSpaces, switchSpace, createSpace, loading } = useSpace();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleSwitchSpace = async (spaceId: string) => {
    try {
      await switchSpace(spaceId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching space:', error);
    }
  };

  const handleCreateSpace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;

    setIsCreating(true);
    try {
      await createSpace(newSpaceName.trim());
      setNewSpaceName('');
      setShowCreateModal(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating space:', error);
      alert('Failed to create space. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-48"></div>
      </div>
    );
  }

  if (!currentSpace) {
    return (
      <button
        onClick={() => setShowCreateModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Create Your First Space
      </button>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span className="font-medium">{currentSpace.name}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
            <div className="p-2">
              <div className="text-xs text-gray-500 px-3 py-1 uppercase tracking-wide">Spaces</div>
              {userSpaces.map((space) => (
                <button
                  key={space.spaceId}
                  onClick={() => handleSwitchSpace(space.spaceId)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-gray-100 transition-colors ${
                    space.spaceId === currentSpace.spaceId ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <div className="font-medium">{space.name}</div>
                  {space.ownerId === currentSpace.ownerId && (
                    <div className="text-xs text-gray-500">Owner</div>
                  )}
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 p-2">
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Space</span>
              </button>
              
              <button
                onClick={() => {
                  // TODO: Navigate to space settings
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Space Settings</span>
              </button>

              <button
                onClick={() => {
                  // TODO: Navigate to members management
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
              >
                <Users className="w-4 h-4" />
                <span>Manage Members</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">Create New Space</h2>
            <form onSubmit={handleCreateSpace}>
              <div className="mb-4">
                <label htmlFor="spaceName" className="block text-sm font-medium text-gray-700 mb-1">
                  Space Name
                </label>
                <input
                  id="spaceName"
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="e.g., Personal Budget, Family Finances"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  disabled={isCreating}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewSpaceName('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isCreating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newSpaceName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
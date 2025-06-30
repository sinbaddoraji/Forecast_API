import { useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface SpaceWithDetails {
  spaceId: string;
  name: string;
  ownerId: string;
  ownerName: string;
  createdAt: string;
  userRole: string;
  joinedAt: string;
  memberCount: number;
}

interface SpaceMemberDetailed {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  joinedAt: string;
}

interface SpaceManagementProps {
  onClose: () => void;
}

export default function SpaceManagement({ onClose }: SpaceManagementProps) {
  const [spaces, setSpaces] = useState<SpaceWithDetails[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<SpaceWithDetails | null>(null);
  const [spaceMembers, setSpaceMembers] = useState<SpaceMemberDetailed[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Member' | 'Owner'>('Member');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = async () => {
    try {
      setLoading(true);
      const spacesData = await apiService.getUserSpacesDetailed();
      setSpaces(spacesData);
    } catch (err: any) {
      setError('Failed to load spaces');
      console.error('Error loading spaces:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadSpaceMembers = async (spaceId: string) => {
    try {
      setLoadingMembers(true);
      const members = await apiService.getSpaceMembers(spaceId);
      // Type assertion since API returns the detailed member data
      setSpaceMembers(members as unknown as SpaceMemberDetailed[]);
    } catch (err: any) {
      setError('Failed to load space members');
      console.error('Error loading space members:', err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleSpaceSelect = (space: SpaceWithDetails) => {
    setSelectedSpace(space);
    loadSpaceMembers(space.spaceId);
  };

  const handleCreateSpace = async () => {
    if (!newSpaceName.trim()) return;

    try {
      await apiService.createSpace({ name: newSpaceName.trim() });
      setNewSpaceName('');
      setShowCreateForm(false);
      await loadSpaces();
    } catch (err: any) {
      setError('Failed to create space');
    }
  };

  const handleSearchUsers = async (email: string) => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await apiService.searchUsers(email);
      setSearchResults(results);
    } catch (err: any) {
      console.error('Error searching users:', err);
      setSearchResults([]);
    }
  };

  const handleAddMember = async (userId?: string) => {
    if (!selectedSpace) return;

    const emailToAdd = userId ? searchResults.find(u => u.userId === userId)?.email : newMemberEmail;
    if (!emailToAdd) return;

    try {
      await apiService.addSpaceMember(selectedSpace.spaceId, emailToAdd, newMemberRole);
      setNewMemberEmail('');
      setSearchResults([]);
      setShowAddMember(false);
      await loadSpaceMembers(selectedSpace.spaceId);
    } catch (err: any) {
      setError('Failed to add member to space');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!selectedSpace) return;

    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await apiService.removeSpaceMember(selectedSpace.spaceId, userId);
      await loadSpaceMembers(selectedSpace.spaceId);
    } catch (err: any) {
      setError('Failed to remove member');
    }
  };

  const handleDeleteSpace = async (space: SpaceWithDetails) => {
    if (!confirm(`Are you sure you want to delete "${space.name}"? This action cannot be undone.`)) return;

    try {
      await apiService.deleteSpace(space.spaceId);
      await loadSpaces();
      if (selectedSpace?.spaceId === space.spaceId) {
        setSelectedSpace(null);
        setSpaceMembers([]);
      }
    } catch (err: any) {
      setError('Failed to delete space');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4">Loading spaces...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Space Management</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">×</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spaces List */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Your Spaces</h3>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Space
              </button>
            </div>

            {showCreateForm && (
              <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                <input
                  type="text"
                  value={newSpaceName}
                  onChange={(e) => setNewSpaceName(e.target.value)}
                  placeholder="Space name"
                  className="w-full px-3 py-2 border rounded-md mb-3"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateSpace}
                    disabled={!newSpaceName.trim()}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {spaces.map((space) => (
                <div
                  key={space.spaceId}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                    selectedSpace?.spaceId === space.spaceId ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => handleSpaceSelect(space)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{space.name}</h4>
                      <p className="text-sm text-gray-600">
                        Owner: {space.ownerName} | Role: {space.userRole}
                      </p>
                      <p className="text-sm text-gray-500">
                        {space.memberCount} member{space.memberCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    {space.userRole === 'Owner' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSpace(space);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Space Members */}
          <div>
            {selectedSpace ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Members of "{selectedSpace.name}"</h3>
                  {selectedSpace.userRole === 'Owner' && (
                    <button
                      onClick={() => setShowAddMember(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Add Member
                    </button>
                  )}
                </div>

                {showAddMember && (
                  <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                    <input
                      type="email"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        handleSearchUsers(e.target.value);
                      }}
                      placeholder="Email address"
                      className="w-full px-3 py-2 border rounded-md mb-3"
                    />
                    
                    {searchResults.length > 0 && (
                      <div className="mb-3 max-h-32 overflow-y-auto border rounded">
                        {searchResults.map((user) => (
                          <div
                            key={user.userId}
                            onClick={() => handleAddMember(user.userId)}
                            className="p-2 hover:bg-gray-100 cursor-pointer"
                          >
                            {user.firstName} {user.lastName} ({user.email})
                          </div>
                        ))}
                      </div>
                    )}

                    <select
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value as 'Member' | 'Owner')}
                      className="w-full px-3 py-2 border rounded-md mb-3"
                    >
                      <option value="Member">Member</option>
                      <option value="Owner">Owner</option>
                    </select>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setShowAddMember(false);
                          setNewMemberEmail('');
                          setSearchResults([]);
                        }}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleAddMember()}
                        disabled={!newMemberEmail.trim()}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        Add Member
                      </button>
                    </div>
                  </div>
                )}

                {loadingMembers ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2">Loading members...</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {spaceMembers.map((member) => (
                      <div key={member.userId} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">
                              {member.firstName} {member.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">{member.email}</p>
                            <p className="text-sm text-gray-500">
                              Role: {member.role} | Joined: {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                          {selectedSpace.userRole === 'Owner' && member.role !== 'Owner' && (
                            <button
                              onClick={() => handleRemoveMember(member.userId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a space to view its members
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
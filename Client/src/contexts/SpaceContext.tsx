import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../AuthService';
import { apiService } from '../services/api';
import type { User, Space } from '../types/api';

interface SpaceContextType {
  currentUser: User | null;
  currentSpace: Space | null;
  userSpaces: Space[];
  loading: boolean;
  error: string | null;
  switchSpace: (spaceId: string) => Promise<void>;
  createSpace: (name: string) => Promise<Space>;
  refreshUser: () => Promise<void>;
  refreshSpaces: () => Promise<void>;
}

const SpaceContext = createContext<SpaceContextType | undefined>(undefined);

export const useSpace = () => {
  const context = useContext(SpaceContext);
  if (!context) {
    throw new Error('useSpace must be used within a SpaceProvider');
  }
  return context;
};

interface SpaceProviderProps {
  children: ReactNode;
}

const SELECTED_SPACE_KEY = 'selectedSpaceId';

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [userSpaces, setUserSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshSpaces = async () => {
    try {
      const spaces = await apiService.getUserSpaces();
      setUserSpaces(spaces);
      
      // If no current space is selected, try to restore from localStorage or select the first space
      if (!currentSpace && spaces.length > 0) {
        const savedSpaceId = localStorage.getItem(SELECTED_SPACE_KEY);
        const savedSpace = spaces.find(s => s.spaceId === savedSpaceId);
        
        if (savedSpace) {
          setCurrentSpace(savedSpace);
        } else {
          // Select the first space by default
          setCurrentSpace(spaces[0]);
          localStorage.setItem(SELECTED_SPACE_KEY, spaces[0].spaceId);
        }
      } else if (currentSpace) {
        // Update current space with latest data
        const updatedSpace = spaces.find(s => s.spaceId === currentSpace.spaceId);
        if (updatedSpace) {
          setCurrentSpace(updatedSpace);
        } else {
          // Current space no longer exists
          setCurrentSpace(spaces.length > 0 ? spaces[0] : null);
          if (spaces.length > 0) {
            localStorage.setItem(SELECTED_SPACE_KEY, spaces[0].spaceId);
          } else {
            localStorage.removeItem(SELECTED_SPACE_KEY);
          }
        }
      }
      
      return spaces;
    } catch (err) {
      console.error('Error fetching spaces:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const oidcUser = await AuthService.getUser();
      if (oidcUser && !oidcUser.expired && oidcUser.access_token) {
        try {
          // Register/get user from our backend
          const user = await apiService.register();
          setCurrentUser(user);
          
          // Fetch user's spaces
          await refreshSpaces();
        } catch (apiError) {
          console.error('Error registering user with backend:', apiError);
          setCurrentUser(null);
          setCurrentSpace(null);
          setUserSpaces([]);
          setError('Failed to connect to backend. Please try logging in again.');
        }
      } else {
        // No valid OIDC user, clear state
        setCurrentUser(null);
        setCurrentSpace(null);
        setUserSpaces([]);
        localStorage.removeItem(SELECTED_SPACE_KEY);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      console.error('Error loading user:', err);
      setCurrentUser(null);
      setCurrentSpace(null);
      setUserSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  const switchSpace = async (spaceId: string) => {
    const space = userSpaces.find(s => s.spaceId === spaceId);
    if (space) {
      setCurrentSpace(space);
      localStorage.setItem(SELECTED_SPACE_KEY, spaceId);
    } else {
      throw new Error('Space not found');
    }
  };

  const createSpace = async (name: string): Promise<Space> => {
    try {
      const newSpace = await apiService.createSpace({ name });
      // Refresh spaces to include the new one
      await refreshSpaces();
      // Switch to the new space
      await switchSpace(newSpace.spaceId);
      return newSpace;
    } catch (err) {
      console.error('Error creating space:', err);
      throw err;
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return (
    <SpaceContext.Provider 
      value={{ 
        currentUser, 
        currentSpace, 
        userSpaces,
        loading, 
        error, 
        switchSpace,
        createSpace,
        refreshUser,
        refreshSpaces
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};
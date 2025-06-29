import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { AuthService } from '../AuthService';
import { apiService } from '../services/api';
import type { User, Space } from '../types/api';

interface SpaceContextType {
  currentUser: User | null;
  currentSpace: Space | null;
  loading: boolean;
  error: string | null;
  switchSpace: (spaceId: string) => Promise<void>;
  refreshUser: () => Promise<void>;
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

export const SpaceProvider: React.FC<SpaceProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          
          // For now, we'll assume the user has a default space
          // In a real app, you'd fetch the user's spaces and let them choose
          // This is a simplified version assuming single space
          const mockSpace: Space = {
            spaceId: user.userId, // Using userId as spaceId for simplicity
            name: `${user.firstName}'s Budget`,
            ownerId: user.userId,
            createdAt: new Date(),
            updatedAt: new Date()
          };
          setCurrentSpace(mockSpace);
        } catch (apiError) {
          console.error('Error registering user with backend:', apiError);
          // If backend registration fails, still clear user state
          setCurrentUser(null);
          setCurrentSpace(null);
          setError('Failed to connect to backend. Please try logging in again.');
        }
      } else {
        // No valid OIDC user, clear state
        setCurrentUser(null);
        setCurrentSpace(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
      console.error('Error loading user:', err);
      setCurrentUser(null);
      setCurrentSpace(null);
    } finally {
      setLoading(false);
    }
  };

  const switchSpace = async (spaceId: string) => {
    // In a real implementation, you'd fetch the space details
    // For now, we'll just update the spaceId
    if (currentSpace) {
      setCurrentSpace({ ...currentSpace, spaceId });
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
        loading, 
        error, 
        switchSpace, 
        refreshUser 
      }}
    >
      {children}
    </SpaceContext.Provider>
  );
};
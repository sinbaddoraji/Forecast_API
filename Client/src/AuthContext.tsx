import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { User } from 'oidc-client-ts';
import { AuthService, userManager } from './AuthService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (provider?: string) => void;
    logout: () => void;
    getAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const user = await AuthService.getUser();
            setUser(user);
            setIsLoading(false);
        };
        
        // Listen for user loaded events (happens after successful signin)
        const handleUserLoaded = (user: User) => {
            setUser(user);
        };
        
        // Listen for user unloaded events (happens after signout)
        const handleUserUnloaded = () => {
            setUser(null);
        };
        
        // Add event listeners
        userManager.events.addUserLoaded(handleUserLoaded);
        userManager.events.addUserUnloaded(handleUserUnloaded);
        
        getUser();
        
        // Cleanup event listeners
        return () => {
            userManager.events.removeUserLoaded(handleUserLoaded);
            userManager.events.removeUserUnloaded(handleUserUnloaded);
        };
    }, []);

    const login = (provider?: string) => {
        AuthService.signinRedirect(provider);
    };

    const logout = () => {
        AuthService.signoutRedirect();
    };

    const getAccessToken = async () => {
        const user = await AuthService.getUser();
        return user?.access_token || null;
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            isLoading,
            login,
            logout,
            getAccessToken
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

import { useEffect } from 'react';
import { AuthService } from './AuthService';
import { useNavigate } from 'react-router-dom';

const SignoutCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const signoutCallback = async () => {
            try {
                await AuthService.signoutRedirectCallback();
                // Clear any remaining auth state and redirect to login
                window.location.href = '/';
            } catch (error) {
                console.error('Error during signout callback:', error);
                // Even on error, redirect to login page
                window.location.href = '/';
            }
        };
        signoutCallback();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Logging out...</p>
            </div>
        </div>
    );
};

export default SignoutCallback;

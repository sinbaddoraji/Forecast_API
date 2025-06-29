import { useEffect } from 'react';
import { AuthService } from './AuthService';
import { useNavigate } from 'react-router-dom';

const SigninCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const signinCallback = async () => {
            try {
                await AuthService.signinRedirectCallback();
                // Force a page reload to update the auth context with the new user
                window.location.href = '/dashboard';
            } catch (error) {
                console.error('Error during signin callback:', error);
                navigate('/');
            }
        };
        signinCallback();
    }, [navigate]);

    return <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Completing sign in...</p>
        </div>
    </div>;
};

export default SigninCallback;

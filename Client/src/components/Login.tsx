import React, { useState } from 'react';
import { LogIn, Shield, TrendingUp, Loader2 } from 'lucide-react';

interface LoginProps {
  onLogin: (provider?: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleLogin = async (provider?: string) => {
    setIsLoading(true);
    setLoadingProvider(provider || 'default');
    try {
      await onLogin(provider);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-6 sm:p-8 space-y-6 sm:space-y-8">
          <div className="text-center space-y-4 sm:space-y-5">
            <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
                Forecast
              </h1>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xs sm:max-w-sm mx-auto">
                Take control of your financial future with smart budgeting and forecasting tools.
              </p>
            </div>
          </div>

          <div className="space-y-5 sm:space-y-6">
            <button
              onClick={() => handleLogin()}
              disabled={isLoading}
              className="group relative w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2.5 sm:py-3 px-6 rounded-xl shadow-sm hover:shadow-md disabled:shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 disabled:translate-y-0 flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              {isLoading && loadingProvider === 'default' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 group-hover:scale-105 transition-transform duration-200" />
              )}
              <span className="text-sm">
                {isLoading && loadingProvider === 'default' ? 'Signing In...' : 'Sign In Securely'}
              </span>
            </button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleLogin('google')}
                disabled={isLoading}
                className="group relative w-12 h-12 bg-white border border-gray-200 hover:border-gray-300 disabled:border-gray-100 rounded-full shadow-sm hover:shadow-md disabled:shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 disabled:translate-y-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Sign in with Google"
              >
                {isLoading && loadingProvider === 'google' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <svg className="w-5 h-5 group-hover:scale-105 transition-transform duration-200" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleLogin('facebook')}
                disabled={isLoading}
                className="group relative w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 rounded-full shadow-sm hover:shadow-md disabled:shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 disabled:translate-y-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Sign in with Facebook"
              >
                {isLoading && loadingProvider === 'facebook' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <svg className="w-5 h-5 text-white group-hover:scale-105 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                )}
              </button>

              <button
                onClick={() => handleLogin('apple')}
                disabled={isLoading}
                className="group relative w-12 h-12 bg-gray-900 hover:bg-black disabled:bg-gray-400 rounded-full shadow-sm hover:shadow-md disabled:shadow-sm transition-all duration-200 transform hover:-translate-y-0.5 disabled:translate-y-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-300"
                aria-label="Sign in with Apple"
              >
                {isLoading && loadingProvider === 'apple' ? (
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                  <svg className="w-5 h-5 text-white group-hover:scale-105 transition-transform duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.13997 6.91 8.85997 6.88C10.15 6.86 11.38 7.75 12.10 7.75C12.81 7.75 14.28 6.68 15.87 6.84C16.57 6.87 18.39 7.12 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z"/>
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 pt-4">
              <Shield className="w-4 h-4" />
              <span>Protected by enterprise-grade security</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-center text-gray-500 leading-relaxed">
              You'll be securely redirected to our authentication provider to complete sign-in. 
              Your data is encrypted and protected at all times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
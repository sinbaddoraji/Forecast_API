import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { SpaceProvider } from './contexts/SpaceContext';
import ProtectedRoute from './ProtectedRoute';
import SigninCallback from './SigninCallback';
import SignoutCallback from './SignoutCallback';
import BudgetingPWA from './components/BudgetingPWA';
import { SpaceGuard } from './components/SpaceGuard';
import Login from './components/Login';

const Home = () => {
    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to="/dashboard" />;
    }

    return <Login onLogin={(provider) => login(provider)} />;
};

function App() {
    return (
        <AuthProvider>
            <SpaceProvider>
                <Router>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/callback" element={<SigninCallback />} />
                        <Route path="/logout" element={<SignoutCallback />} />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <SpaceGuard>
                                        <BudgetingPWA />
                                    </SpaceGuard>
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </Router>
            </SpaceProvider>
        </AuthProvider>
    );
}

export default App;
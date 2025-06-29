import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import SigninCallback from './SigninCallback';
import SignoutCallback from './SignoutCallback';
import BudgetingPWA from './components/BudgetingPWA';
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
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/callback" element={<SigninCallback />} />
                    <Route path="/logout" element={<SignoutCallback />} />
                    <Route
                        path="/dashboard"
                        element={<ProtectedRoute><BudgetingPWA /></ProtectedRoute>}
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
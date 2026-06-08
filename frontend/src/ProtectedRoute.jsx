import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div style={{
                display: 'grid',
                placeItems: 'center',
                minHeight: '100vh',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '2px'
            }}>
                LOADING...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;

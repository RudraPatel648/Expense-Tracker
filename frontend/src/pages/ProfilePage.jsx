import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import api from '../api';
import '../auth.css';

function ProfilePage() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({ count: 0, total: 0 });
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/api/v1/expenses');
                if (res && res.ok) {
                    const data = await res.json();
                    const expenses = data.expenses || [];
                    setStats({
                        count: expenses.length,
                        total: expenses.reduce((sum, e) => sum + e.amount, 0)
                    });
                }
            } catch {
                // Stats will show 0
            }
        };
        fetchStats();
    }, []);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await logout();
        navigate('/login', { replace: true });
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        : 'N/A';

    return (
        <div className="profile-page">
            <div className="profile-nav">
                <Link to="/" className="brand" style={{ textDecoration: 'none' }}>
                    <div className="brand__logo">$</div>
                    <span className="brand__name">STACKS</span>
                </Link>
                <Link to="/" className="btn btn--dark" style={{ textDecoration: 'none', fontSize: '12px' }}>
                    ← DASHBOARD
                </Link>
            </div>

            <div className="profile-card">
                <h1 className="profile-name">{user?.name?.toUpperCase() || 'USER'}</h1>
                <p className="profile-email">{user?.email || ''}</p>

                <div className="profile-stats">
                    <div className="profile-stat bg-lime">
                        <p className="micro">TOTAL EXPENSES</p>
                        <p className="stat__num">{stats.count}</p>
                    </div>
                    <div className="profile-stat bg-butter">
                        <p className="micro">TOTAL SPENT</p>
                        <p className="stat__num">${stats.total}</p>
                    </div>
                </div>

                <div className="profile-meta">
                    MEMBER SINCE: {memberSince}
                </div>

                <button
                    className="btn--logout"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    id="logout-btn"
                >
                    {isLoggingOut ? 'LOGGING OUT...' : 'LOG OUT →'}
                </button>
            </div>
        </div>
    );
}

export default ProfilePage;

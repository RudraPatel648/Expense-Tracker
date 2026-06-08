import { createContext, useContext, useState, useEffect } from 'react';
import Auth, { API_BASE } from './auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const initAuth = async () => {
        setLoading(true);
        try {
            const data = await Auth.init();
            if (data && data.user) {
                setUser(data.user);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        initAuth();
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw { status: res.status, msg: data.msg };
        }

        Auth.setToken(data.accessToken);
        setUser(data.user);
        return data;
    };

    const signup = async (name, email, password) => {
        const res = await fetch(`${API_BASE}/api/auth/signup`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            throw { status: res.status, msg: data.msg };
        }

        Auth.setToken(data.accessToken);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    ...(Auth.getToken() ? { Authorization: `Bearer ${Auth.getToken()}` } : {})
                }
            });
        } catch {
            // Even if server call fails, clear local state
        }
        Auth.clearToken();
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        initAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;

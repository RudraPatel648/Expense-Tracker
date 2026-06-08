// In-memory token store — NEVER localStorage, NEVER sessionStorage
let _accessToken = null;

const API_BASE = import.meta.env.VITE_API_URL || 'https://expense-tracker-4enw.onrender.com';

const Auth = {
    setToken(token) { _accessToken = token; },
    getToken() { return _accessToken; },
    isAuthenticated() { return !!_accessToken; },
    clearToken() { _accessToken = null; },

    async refresh() {
        try {
            const res = await fetch(`${API_BASE}/api/auth/refresh`, {
                method: 'POST',
                credentials: 'include' // sends httpOnly cookie automatically
            });
            if (!res.ok) throw new Error();
            const data = await res.json();
            _accessToken = data.accessToken;
            return data;
        } catch {
            _accessToken = null;
            return null;
        }
    },

    async init() {
        const data = await Auth.refresh();
        return data ? data : null;
    }
};

export { API_BASE };
export default Auth;

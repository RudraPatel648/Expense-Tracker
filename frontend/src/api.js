import Auth, { API_BASE } from './auth';

const apiCall = async (endpoint, options = {}) => {
    const makeRequest = async () => fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(Auth.getToken() ? { Authorization: `Bearer ${Auth.getToken()}` } : {}),
            ...options.headers
        }
    });

    let res = await makeRequest();

    // Auto-refresh on 401
    if (res.status === 401) {
        const data = await Auth.refresh();
        if (data) {
            res = await makeRequest(); // retry with new token
        } else {
            Auth.clearToken();
            window.location.href = '/Expense-Tracker/login';
            return null;
        }
    }

    return res;
};

const api = {
    get: (url) => apiCall(url, { method: 'GET' }),
    post: (url, body) => apiCall(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => apiCall(url, { method: 'PUT', body: JSON.stringify(body) }),
    patch: (url, body) => apiCall(url, { method: 'PATCH', body: JSON.stringify(body) }),
    delete: (url) => apiCall(url, { method: 'DELETE' })
};

export default api;

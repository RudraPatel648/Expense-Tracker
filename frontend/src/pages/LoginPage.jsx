import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../auth.css';

function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/', { replace: true });
        } catch (err) {
            if (err.status === 401) {
                setError("WRONG CREDENTIALS. TRY AGAIN.");
            } else if (err.status === 429) {
                setError("TOO MANY ATTEMPTS. WAIT 15 MINUTES.");
            } else {
                setError("SERVER'S DOWN. NOT YOUR FAULT.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="brand">
                    <div className="brand__logo">$</div>
                    <span className="brand__name">STACKS</span>
                </div>
                <span className="auth-tagline">TRACK HARD. LOG EVERYTHING.</span>

                <form className="auth-form" onSubmit={handleSubmit} id="login-form">
                    {error && <div className="auth-error" id="login-error">{error}</div>}

                    <div>
                        <label htmlFor="login-email">EMAIL</label>
                        <input
                            id="login-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="login-password">PASSWORD</label>
                        <input
                            id="login-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="off"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            )}
                        </button>
                    </div>

                    <button
                        type="submit"
                        className="btn--auth"
                        disabled={isLoading}
                        id="login-submit"
                    >
                        {isLoading ? 'CHECKING...' : 'GET IN →'}
                    </button>
                </form>

                <div className="auth-link">
                    <Link to="/signup">NO ACCOUNT? MAKE ONE.</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;

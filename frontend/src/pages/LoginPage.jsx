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
                            autoComplete="email"
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
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? '🙈' : '👁'}
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

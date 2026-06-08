import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../auth.css';

function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    // Password strength calculation
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { level: '', percent: 0, label: '' };

        let score = 0;
        if (pwd.length >= 8) score++;
        if (pwd.length >= 12) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;

        if (score <= 1) return { level: 'weak', percent: 25, label: 'WEAK' };
        if (score <= 2) return { level: 'fair', percent: 50, label: 'FAIR' };
        if (score <= 3) return { level: 'good', percent: 75, label: 'GOOD' };
        return { level: 'strong', percent: 100, label: 'STRONG' };
    };

    const strength = getPasswordStrength(password);

    // Client-side validation
    const validate = () => {
        const errors = {};

        if (!name.trim()) {
            errors.name = 'NAME IS REQUIRED.';
        }

        if (!email.trim()) {
            errors.email = 'EMAIL IS REQUIRED.';
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            errors.email = 'INVALID EMAIL FORMAT.';
        }

        if (!password) {
            errors.password = 'PASSWORD IS REQUIRED.';
        } else if (password.length < 8) {
            errors.password = 'MIN 8 CHARACTERS.';
        } else if (!/[A-Z]/.test(password)) {
            errors.password = 'NEEDS AT LEAST 1 UPPERCASE LETTER.';
        } else if (!/[0-9]/.test(password)) {
            errors.password = 'NEEDS AT LEAST 1 NUMBER.';
        }

        if (password !== confirmPassword) {
            errors.confirmPassword = "PASSWORDS DON'T MATCH.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validate()) return;

        setIsLoading(true);

        try {
            await signup(name.trim(), email.trim(), password);
            navigate('/', { replace: true });
        } catch (err) {
            if (err.status === 409) {
                setError("THAT EMAIL'S TAKEN.");
            } else if (err.status === 429) {
                setError("TOO MANY ATTEMPTS. WAIT 15 MINUTES.");
            } else {
                setError(err.msg || "SERVER'S DOWN. NOT YOUR FAULT.");
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
                <span className="auth-tagline">JOIN THE STACK. TRACK YOUR CASH.</span>

                <form className="auth-form" onSubmit={handleSubmit} id="signup-form">
                    {error && <div className="auth-error" id="signup-error">{error}</div>}

                    <div>
                        <label htmlFor="signup-name">NAME</label>
                        <input
                            id="signup-name"
                            type="text"
                            placeholder="what do they call you?"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={fieldErrors.name ? 'input-error' : ''}
                            autoComplete="name"
                        />
                        {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}
                    </div>

                    <div>
                        <label htmlFor="signup-email">EMAIL</label>
                        <input
                            id="signup-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={fieldErrors.email ? 'input-error' : ''}
                            autoComplete="email"
                        />
                        {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
                    </div>

                    <div className="input-group">
                        <label htmlFor="signup-password">PASSWORD</label>
                        <input
                            id="signup-password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="min 8 chars, 1 uppercase, 1 number"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setFieldErrors(prev => ({ ...prev, password: '' })); }}
                            className={fieldErrors.password ? 'input-error' : ''}
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label="Toggle password visibility"
                        >
                            {showPassword ? '🙈' : '👁'}
                        </button>
                        {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}

                        {password && (
                            <>
                                <div className="strength-bar-container">
                                    <div
                                        className={`strength-bar-fill ${strength.level}`}
                                        style={{ width: `${strength.percent}%` }}
                                    />
                                </div>
                                <span className={`strength-label ${strength.level}`}>{strength.label}</span>
                            </>
                        )}
                    </div>

                    <div>
                        <label htmlFor="signup-confirm">CONFIRM PASSWORD</label>
                        <input
                            id="signup-confirm"
                            type="password"
                            placeholder="type it again"
                            value={confirmPassword}
                            onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors(prev => ({ ...prev, confirmPassword: '' })); }}
                            className={fieldErrors.confirmPassword ? 'input-error' : ''}
                            autoComplete="new-password"
                        />
                        {fieldErrors.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword}</span>}
                    </div>

                    <button
                        type="submit"
                        className="btn--auth"
                        disabled={isLoading}
                        id="signup-submit"
                    >
                        {isLoading ? 'CREATING...' : 'JOIN THE STACK →'}
                    </button>
                </form>

                <div className="auth-link">
                    <Link to="/login">ALREADY IN? LOG IN.</Link>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;

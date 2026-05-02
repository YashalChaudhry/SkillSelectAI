import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import '../LandingPage/LandingPage.css';
import './PasswordResetPages.css';

const validatePassword = (password) => {
  if (!password) return 'Please enter a new password.';
  if (password.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'Password must include both letters and numbers.';
  }
  return '';
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tokenFromQuery = searchParams.get('token');
    if (tokenFromQuery) {
      sessionStorage.setItem('passwordResetToken', tokenFromQuery);
      setToken(tokenFromQuery);
      navigate('/reset-password', { replace: true });
      return;
    }

    const savedToken = sessionStorage.getItem('passwordResetToken') || '';
    setToken(savedToken);
  }, [navigate, searchParams]);

  const handleNewPasswordChange = (value) => {
    setNewPassword(value);
    setNewPasswordError(validatePassword(value));

    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (!value) {
      setConfirmPasswordError('Please confirm your password.');
      return;
    }
    if (value !== newPassword) {
      setConfirmPasswordError('Passwords do not match.');
      return;
    }
    setConfirmPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');

    const passwordError = validatePassword(newPassword);
    const confirmError = !confirmPassword
      ? 'Please confirm your password.'
      : newPassword !== confirmPassword
      ? 'Passwords do not match.'
      : '';

    setNewPasswordError(passwordError);
    setConfirmPasswordError(confirmError);

    if (!token) {
      setApiError('Reset link is invalid or has expired.');
      return;
    }

    if (passwordError || confirmError) {
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5000/api/auth/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setApiError(data.message || 'Failed to reset password.');
        return;
      }

      sessionStorage.removeItem('passwordResetToken');
      setSuccess('Password reset successful. Redirecting...');
      setTimeout(() => navigate('/'), 900);
    } catch (requestError) {
      setApiError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="landing-container" style={{ backgroundImage: "url('/LandingPage.png')" }}>
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="SkillSelectAI Logo" className="navbar-logo" />
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/">How It Works</Link>
          <Link to="/">Why SkillSelectAI</Link>
          <Link to="/">About Us</Link>
        </div>
        <div className="nav-auth">
          <Link className="btn-login reset-nav-link" to="/?auth=login">Login / Sign Up</Link>
        </div>
      </nav>

      <main className="hero-section reset-page-main" id="home">
        <div className="reset-card">
          <h1 className="reset-title">Create New Password</h1>
          <p className="reset-subtitle">Set your new password to complete account recovery.</p>

          {!token && <p className="reset-error">Reset link is invalid or has expired.</p>}

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="reset-input-shell">
              <label htmlFor="new-password" className="reset-input-label">New password</label>
              <div className={newPasswordError ? 'reset-field-wrap invalid' : 'reset-field-wrap'}>
                <span className="reset-field-icon" aria-hidden="true">*</span>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                  className="reset-field-input"
                />
              </div>
            </div>
            {newPasswordError && <p className="reset-error">{newPasswordError}</p>}

            <div className="reset-input-shell">
              <label htmlFor="confirm-password" className="reset-input-label">Confirm password</label>
              <div className={confirmPasswordError ? 'reset-field-wrap invalid' : 'reset-field-wrap'}>
                <span className="reset-field-icon" aria-hidden="true">*</span>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className="reset-field-input"
                />
              </div>
            </div>
            {confirmPasswordError && <p className="reset-error">{confirmPasswordError}</p>}

            {apiError && <p className="reset-error">{apiError}</p>}
            {success && <p className="reset-success">{success}</p>}

            <button type="submit" className="btn-hero reset-btn" disabled={isSubmitting || !token}>
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ResetPasswordPage;

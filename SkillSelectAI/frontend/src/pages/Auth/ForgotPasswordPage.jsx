import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../LandingPage/LandingPage.css';
import './PasswordResetPages.css';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalized = email.trim().toLowerCase();

    if (!normalized) {
      setError('Please enter your registered email.');
      return;
    }

    if (!isValidEmail(normalized)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5000/api/auth/forgot-password/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalized }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.message || 'Failed to process request.');
        return;
      }

      setSuccess(data.message || 'Password reset link sent to your email.');
    } catch (requestError) {
      setError('Network error. Please try again.');
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
          <h1 className="reset-title">Forgot Password</h1>
          <p className="reset-subtitle">Enter your registered email address to receive a password reset link.</p>

          <form className="reset-form" onSubmit={handleSubmit}>
            <div className="reset-input-shell">
              <label htmlFor="forgot-email" className="reset-input-label">Email address</label>
              <div className={email && !isValidEmail(email.trim()) ? 'reset-field-wrap invalid' : 'reset-field-wrap'}>
                <span className="reset-field-icon" aria-hidden="true">@</span>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="reset-field-input"
                />
              </div>
            </div>

            {error && <p className="reset-error">{error}</p>}
            {success && <p className="reset-success">{success}</p>}

            <button type="submit" className="btn-hero reset-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <p className="reset-helper-text">
            Remembered your password? <Link to="/?auth=login">Back to Login</Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;

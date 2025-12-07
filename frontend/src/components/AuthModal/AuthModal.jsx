import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './AuthModal.css';

const AuthModal = ({ onClose, onAuthSuccess }) => {
  // Default to false (Sign In) or true (Sign Up) depending on your preference
  const [isSignUpActive, setIsSignUpActive] = useState(false);
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegisterClick = () => {
    setIsSignUpActive(true);
  };

  const handleSignInClick = () => {
    setIsSignUpActive(false);
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!signUpEmail || !signUpPassword || !signUpName) {
      setAuthError('Please fill all required fields.');
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName,
          email: signUpEmail,
          password: signUpPassword,
          role: 'recruiter',
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.message || 'Failed to sign up.');
        return;
      }

      if (data.token) {
        window.localStorage.setItem('authToken', data.token);
      }
      if (onAuthSuccess && data.user) {
        onAuthSuccess(data.user);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!loginEmail || !loginPassword) {
      setAuthError('Please enter email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setAuthError(data.message || 'Failed to login.');
        return;
      }

      if (data.token) {
        window.localStorage.setItem('authToken', data.token);
      }
      if (onAuthSuccess && data.user) {
        onAuthSuccess(data.user);
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      setAuthError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div 
        className={`container ${isSignUpActive ? "right-panel-active" : ""}`} 
        id="container"
        onClick={handleContentClick}
      >
        {/* Close Button - Z-Index boosted in CSS to stay on top */}
        <button className="close-modal-btn" onClick={onClose}>×</button>

        {/* --- SIGN UP FORM (Registration) --- */}
        <div className="form-container sign-up-container">
          <form className="auth-form" onSubmit={handleSignUpSubmit}>
            <h1 className="auth-title">Registration</h1>
            
            <div className="input-group">
                <input
                  type="text"
                  placeholder="Company Name"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                />
                <i className="fas fa-user input-icon"></i>
            </div>
            <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                />
                <i className="fas fa-envelope input-icon"></i>
            </div>
            <div className="input-group">
                <input
                  type="password"
                  placeholder="Password"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                />
                <i className="fas fa-lock input-icon"></i>
            </div>
            <div className="input-group">
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={signUpConfirmPassword}
                  onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                />
                <i className="fas fa-lock input-icon"></i>
            </div>

            {authError && <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{authError}</p>}
            <button className="auth-btn purple-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Register'}
            </button>
          </form>
        </div>

        {/* --- SIGN IN FORM (Login) --- */}
        <div className="form-container sign-in-container">
          <form className="auth-form" onSubmit={handleLoginSubmit}>
            <h1 className="auth-title">Login</h1>
            
            <div className="input-group">
                <input
                  type="email"
                  placeholder="Email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
                <i className="fas fa-envelope input-icon"></i>
            </div>
            <div className="input-group">
                 <input
                   type="password"
                   placeholder="Password"
                   value={loginPassword}
                   onChange={(e) => setLoginPassword(e.target.value)}
                 />
                 <i className="fas fa-lock input-icon"></i>
            </div>
            
            <button type="button" className="forgot-pass-btn">Forgot your password?</button>
            {authError && <p style={{ color: '#ff6b6b', marginTop: '10px' }}>{authError}</p>}
            <button className="auth-btn purple-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Processing...' : 'Login'}
            </button>
          </form>
        </div>

        {/* --- OVERLAY SLIDER --- */}
        <div className="overlay-container">
          <div className="overlay">
            
            {/* Left Panel (Visible when Sign In form is hidden) */}
            <div className="overlay-panel overlay-left">
              <div className="overlay-content">
                <h1 className="auth-title white-text">Welcome Back!</h1>
                <p className="auth-p">Already have an account? Access your dashboard and continue hiring smarter.</p>
                <button className="auth-btn transparent-btn" onClick={handleSignInClick}>
                  Login
                </button>
              </div>
            </div>

            {/* Right Panel (Visible when Sign Up form is hidden) */}
            <div className="overlay-panel overlay-right">
              <div className="overlay-content">
                <h1 className="auth-title white-text">New Here?</h1>
                <p className="auth-p">Join SkillSelectAI and transform the way you recruit.</p>
                <button className="auth-btn transparent-btn" onClick={handleRegisterClick}>
                  Register
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default AuthModal;
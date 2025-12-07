// 1. Import useState
import React, { useState } from 'react';
import './LandingPage.css';
// 2. Import the new Modal component
import AuthModal from '../../components/AuthModal/AuthModal';

// Note: We removed 'onLogin' prop as the modal handles it internally now, 
// but kept it in definition just in case you use it elsewhere.
const LandingPage = ({ onLogin }) => {
  
  // 3. State to manage modal visibility
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Helper functions to open/close modal
  const openModal = () => setShowAuthModal(true);
  const closeModal = () => setShowAuthModal(false);

  return (
    <div 
      className="landing-container"
      style={{ backgroundImage: "url('/LandingPage.png')" }}
    >
      
      {/* --- NAVBAR --- */}
      <nav className="navbar">
        <div className="logo-container">
          <img src="/logo.png" alt="SkillSelectAI Logo" className="navbar-logo" />
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#why-us">Why SkillSelectAI</a>
          <a href="#about">About Us</a>
        </div>
        <div className="nav-auth">
          {/* 4. Update onClick to openModal */}
          <button className="btn-login" onClick={openModal}>Login / Sign Up</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="hero-section" id="home">
        <div className="hero-content">
          <h1 className="hero-title">
            Hiring <span className="gradient-text">Redefined.</span>
          </h1>
          <p className="hero-subtitle">
            Step into the future of recruitment where efficiency meets excellence.
          </p>
          {/* 4. Update onClick to openModal */}
          <button className="btn-hero" onClick={openModal}>Get Started</button>
        </div>
      </header>

      {/* ... (Keep rest of How It Works, Why Us, About Us exactly the same) ... */}
      <section className="how-it-works-section" id="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Streamline your hiring process in 5 simple steps.</p>
        </div>
        <div className="steps-wrapper">
          <div className="steps-row-2">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Create a Job</h3>
              <p>Add a job name, description, and upload the CVs you want to evaluate.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>AI Shortlists Candidates</h3>
              <p>Our system instantly parses every CV, matches it with the job description, and filters out top candidates based on relevance.</p>
            </div>
          </div>
          <div className="steps-row-3">
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>AI Schedules & Interviews</h3>
              <p>Shortlisted candidates receive automated interview invitationsand complete an AI-powered voice or video interview.</p>
            </div>
            <div className="step-card">
              <div className="step-number">04</div>
              <h3>Get Smart Insights</h3>
              <p>Each interview is recorded, analyzed, and scored on key factors like communication, confidence, and answer accuracy.</p>
            </div>
            <div className="step-card">
              <div className="step-number">05</div>
              <h3>See Ranked Results</h3>
              <p>View an ordered list of candidates, complete with scores, profiles, and interview recordings, so you can hire with confidence.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="why-us-section" id="why-us">
        <div className="section-header">
          <h2 className="section-title">Why SkillSelectAI?</h2>
          <p className="section-subtitle">The smartest way to build your dream team.</p>
        </div>
        <div className="features-grid">
          <div className="feature-item">
            <h3>Smarter Shortlisting</h3>
            <p>Our AI scans resumes, extracts skills, and instantly identifies the best-fit candidates — saving hours of manual screening.</p>
          </div>
          <div className="feature-item">
            <h3>AI-Driven Interviews</h3>
            <p>Candidates face unbiased, consistent voice/video interviews conducted by AI, ensuring fair evaluation every time.</p>
          </div>
          <div className="feature-item">
            <h3>Automated Evaluation</h3>
            <p>From communication to technical skills, the AI scores every candidate using standardized criteria for accurate, data-backed results.</p>
          </div>
          <div className="feature-item">
            <h3>End-to-End Workflow</h3>
            <p>From job posting → CV parsing → AI interviews → final ranking — everything happens on one platform.</p>
          </div>
          <div className="feature-item">
            <h3>Faster Hiring</h3>
            <p>Cut your hiring time by up to 70% with automated scheduling, reminders, and instant interview summaries.</p>
          </div>
          <div className="feature-item">
            <h3>Bias-Free Decisions</h3>
            <p>AI removes human bias, ensuring equal opportunities and fair hiring outcomes.</p>
          </div>
          <div className="feature-item full-width-item">
            <h3>Insights That Matter</h3>
            <p>Get detailed interview reports, skill breakdowns, and performance analytics to make confident hiring decisions.</p>
          </div>
        </div>
      </section>

      <section className="about-section" id="about">
        <div className="about-container">
          <h2 className="section-title">About Us</h2>
          <div className="about-main-statement">
            <p>
              "We built SkillSelectAI on a simple belief: <br />
              <span className="gradient-text">hiring should be efficient, fair, and data-driven."</span>
            </p>
          </div>
          <div className="about-story-centered">
            <p>
              At SkillSelectAI, we’re redefining how companies hire. Our platform combines advanced artificial intelligence with a seamless workflow to help organizations find the right talent—faster, smarter, and without the usual complexity of traditional recruitment.
            </p>
            <p>
              From automated CV parsing to AI-conducted interviews and candidate ranking, we provide a complete end-to-end solution that empowers recruiters to make confident decisions with clarity.
            </p>
            <p>
              Our team is dedicated to creating technology that not only saves time but also elevates the quality of every hiring decision. With innovation at the core, SkillSelectAI continues to evolve to meet the future of recruitment.
            </p>
            <div className="about-divider"></div>
            <p className="about-closing">
              We’re here to help companies hire better — <span className="highlight-white">with intelligence, transparency, and excellence.</span>
            </p>
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="footer">
        <p>© 2025 SkillSelectAI. All rights reserved.</p>
      </footer>

      {/* 5. Conditionally render the Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={closeModal}
          onAuthSuccess={onLogin}
        />
      )}

    </div>
  );
};

export default LandingPage;
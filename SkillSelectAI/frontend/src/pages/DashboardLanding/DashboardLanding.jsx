import React from "react";
import Lottie from "lottie-react";
import interviewsAnimation from "../../assets/lottie/interviews.json";
import screeningAnimation from "../../assets/lottie/screening.json";
import helloAnimation from "../../assets/lottie/hello.json";
import "./DashboardLanding.css";

const DashboardLanding = () => {
  return (
    <div className="dl-container">
      <header className="dl-header">
        <h1 className="dl-title">
          Hire smarter, <span className="dl-title-gradient">not harder</span>
        </h1>
        <p className="dl-subtitle">
          SkillSelectAI automates your entire recruitment pipeline, from CV screening to AI-conducted
          interviews
        </p>
      </header>

      <section className="dl-boxes" aria-label="Dashboard overview">
        <div className="dl-box dl-box--tall">
          <div className="dl-start">
            <div className="dl-corner-lottie" aria-hidden="true">
              <Lottie
                animationData={helloAnimation}
                loop
                autoplay
                rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>

            <div className="dl-start-header">
              <div className="dl-start-kicker">Get Started</div>
              <h2 className="dl-start-title">How SkillSelectAI Works</h2>
              <p className="dl-start-subtitle">
                New here? Get started in minutes with this quick walkthrough.
              </p>
            </div>

            <div className="dl-steps" aria-label="Quick walkthrough">
              <div className="dl-step">
                <div className="dl-step-num">1</div>
                <div className="dl-step-text">
                  <span className="dl-step-title">Create a Job</span>
                  <span className="dl-step-desc">Add title, description &amp; upload CVs.</span>
                </div>
              </div>

              <div className="dl-step">
                <div className="dl-step-num">2</div>
                <div className="dl-step-text">
                  <span className="dl-step-title">AI Screens CVs</span>
                  <span className="dl-step-desc">Candidates ranked by match score.</span>
                </div>
              </div>

              <div className="dl-step">
                <div className="dl-step-num">3</div>
                <div className="dl-step-text">
                  <span className="dl-step-title">Interviews Run</span>
                  <span className="dl-step-desc">AI conducts voice or video interviews.</span>
                </div>
              </div>

              <div className="dl-step">
                <div className="dl-step-num">4</div>
                <div className="dl-step-text">
                  <span className="dl-step-title">Review &amp; Hire</span>
                  <span className="dl-step-desc">See scores, recordings &amp; AI reports.</span>
                </div>
              </div>
            </div>

            <button className="dl-tutorial-btn" type="button">
              Watch a tutorial
            </button>
          </div>
        </div>
        <div className="dl-box dl-box--feature">
          <div className="dl-box-content">
            <div className="dl-box-copy">
              <div className="dl-box-kicker">Interviews</div>
              <h2 className="dl-box-title">Voice &amp; Video AI Interviews</h2>
              <p className="dl-box-text">
                AI conducts the full interview and evaluates candidates across multiple dimensions
                in real time. Recording saved to each profile.
              </p>
            </div>

            <div className="dl-lottie-slot" aria-hidden="true">
              <Lottie animationData={interviewsAnimation} loop autoplay style={{ width: "100%", height: "100%" }} />
            </div>
          </div>
        </div>
        <div className="dl-box dl-box--feature">
          <div className="dl-box-content dl-box-content--stack">
            <div className="dl-box-copy">
              <div className="dl-box-kicker">AI Screening</div>
              <h2 className="dl-box-title">CV Parsing &amp; Smart Ranking</h2>
              <p className="dl-box-text">
                Upload any number of CVs. AI extracts skills, experience &amp; keywords &amp; then ranks
                every candidate by match score instantly.
              </p>
            </div>

            <div className="dl-lottie-under" aria-hidden="true">
              <Lottie
                className="dl-lottie"
                animationData={screeningAnimation}
                loop
                autoplay
                rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardLanding;

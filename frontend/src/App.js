// src/App.jsx
import React, { useState } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Candidates from "./pages/Candidates/Candidates";
import JobManagement from "./pages/JobManagement/JobManagement";
import LandingPage from "./pages/LandingPage/LandingPage";

function App() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activePage, setActivePage] = useState("candidates");

  // 1. LANDING PAGE MODE
  if (!showDashboard) {
    return (
      // FIX: We wrap this in a div with 'overflowY: auto' to force scrolling
      // even if your global body styles try to lock it.
      <div style={{ height: "100vh", width: "100vw", overflowY: "auto" }}>
        <LandingPage onLogin={() => setShowDashboard(true)} />
      </div>
    );
  }

  // 2. DASHBOARD MODE (Your existing locked layout)
  return (
    <div style={{ 
      display: "flex", 
      backgroundColor: "#000", 
      height: '100%',
      width: '100%',
      position: 'fixed', // This locks the dashboard
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflow: 'hidden' // This prevents dashboard scroll
    }}>
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ 
        flex: 1, 
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {activePage === "candidates" && <Candidates />}
        {activePage === "jobManagement" && <JobManagement />}
      </div>
    </div>
  );
}

export default App;
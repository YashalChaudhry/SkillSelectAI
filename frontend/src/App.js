// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Candidates from "./pages/Candidates/Candidates";
import JobManagement from "./pages/JobManagement/JobManagement";
import Interviews from "./pages/Interviews/Interviews";
import LandingPage from "./pages/LandingPage/LandingPage";
import InterviewPage from "./pages/InterviewPage";

function Dashboard() {
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

  // 2. DASHBOARD MODE (Your existing layout)
  return (
    <div style={{ 
      display: "flex", 
      backgroundColor: "#000", 
      minHeight: '100vh',
      width: '100%'
    }}>
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        onLogout={() => setShowDashboard(false)} 
      />
      <div style={{ 
        flex: 1, 
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        {activePage === "candidates" && <Candidates />}
        {activePage === "jobManagement" && <JobManagement />}
        {activePage === "interviews" && <Interviews />}
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/*" element={<Dashboard />} />
    </Routes>
  );
}

export default App;
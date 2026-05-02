// src/App.jsx
import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import Candidates from "./pages/Candidates/Candidates";
import JobManagement from "./pages/JobManagement/JobManagement";
import Interviews from "./pages/Interviews/Interviews";
import Ranking from "./pages/Ranking/Ranking";
import DashboardLanding from "./pages/DashboardLanding/DashboardLanding";
import LandingPage from "./pages/LandingPage/LandingPage";
import InterviewPage from "./pages/InterviewPage";
import Settings from "./pages/Settings/Settings";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminPanel from "./pages/Admin/AdminPanel";
import ForgotPasswordPage from "./pages/Auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/Auth/ResetPasswordPage";
import LoadingProvider from "./components/LoadingOverlay/LoadingProvider";
import LoadingOverlay from "./components/LoadingOverlay/LoadingOverlay";
import AppModalProvider from "./components/AppModal/AppModalProvider";
import ToastProvider from "./components/Toast/ToastProvider";

function Dashboard() {
  const [showDashboard, setShowDashboard] = useState(false);
  const [activePage, setActivePage] = useState("dashboardLanding");

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
      backgroundColor: "var(--app-bg)", 
      minHeight: '100vh',
      width: '100%',
      paddingLeft: '80px', // match fixed sidebar width so content doesn't overlap
      boxSizing: 'border-box'
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
        backgroundColor: 'var(--app-bg)'
      }}>
        {activePage === "dashboardLanding" && <DashboardLanding />}
        {activePage === "candidates" && <Candidates />}
        {activePage === "jobManagement" && <JobManagement />}
        {activePage === "interviews" && <Interviews />}
        {activePage === "ranking" && <Ranking />}
        {activePage === "settings" && <Settings onLogout={() => setShowDashboard(false)} />}
      </div>
    </div>
  );
}

function App() {
  return (
    <LoadingProvider>
      <AppModalProvider>
        <ToastProvider>
          <LoadingOverlay />
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/interview" element={<InterviewPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/*" element={<Dashboard />} />
          </Routes>
        </ToastProvider>
      </AppModalProvider>
    </LoadingProvider>
  );
}

export default App;
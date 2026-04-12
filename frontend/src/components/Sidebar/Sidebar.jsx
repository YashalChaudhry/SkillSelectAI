import React from "react";
import {
  HomeOutlined,
  PersonOutline,
  WorkOutline,
  QuestionAnswerOutlined,
  LogoutOutlined,
  Leaderboard,
  SettingsOutlined,
} from "@mui/icons-material";
import "./Sidebar.css";

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    onLogout();
  };

  return (
    <div className="sidebar">
      {/* Shared gradient defs for sidebar icons (matches LandingPage gradient) */}
      <svg className="sidebar-gradient-defs" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="landing-page-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="50%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#9333ea" />
          </linearGradient>
        </defs>
      </svg>

      <div className="sidebar-menu">
        {/* Dashboard Landing Icon */}
        <div
          className={`sidebar-icon-box ${activePage === "dashboardLanding" ? "active" : ""}`}
          onClick={() => setActivePage("dashboardLanding")}
        >
          <HomeOutlined className="sidebar-icon" />
        </div>

        {/* Job Management Icon */}
        <div
          className={`sidebar-icon-box ${activePage === "jobManagement" ? "active" : ""}`}
          onClick={() => setActivePage("jobManagement")}
        >
          <WorkOutline className="sidebar-icon" />
        </div>

        {/* Candidates Icon */}
        <div
          className={`sidebar-icon-box ${activePage === "candidates" ? "active" : ""}`}
          onClick={() => setActivePage("candidates")}
        >
          <PersonOutline className="sidebar-icon" />
        </div>

        {/* Interviews Icon */}
        <div
          className={`sidebar-icon-box ${activePage === "interviews" ? "active" : ""}`}
          onClick={() => setActivePage("interviews")}
        >
          <QuestionAnswerOutlined className="sidebar-icon" />
        </div>

        {/* Ranking Icon */}
        <div
          className={`sidebar-icon-box ${activePage === "ranking" ? "active" : ""}`}
          onClick={() => setActivePage("ranking")}
        >
          <Leaderboard className="sidebar-icon" />
        </div>
      </div>

      <div className="sidebar-footer">
        <div
          className={`sidebar-icon-box ${activePage === "settings" ? "active" : ""}`}
          onClick={() => setActivePage("settings")}
        >
          <SettingsOutlined className="sidebar-icon" />
        </div>

        <div className="sidebar-icon-box logout-btn" onClick={handleLogout}>
          <LogoutOutlined className="sidebar-icon" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

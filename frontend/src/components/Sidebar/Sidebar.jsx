import React from "react";
import { PersonOutline, WorkOutline, QuestionAnswerOutlined, LogoutOutlined } from "@mui/icons-material";
import "./Sidebar.css";

const Sidebar = ({ activePage, setActivePage, onLogout }) => {
  const handleLogout = () => {
    // Clear any stored authentication data
    localStorage.removeItem('authToken');
    // Call the logout function passed from parent
    onLogout();
  };
  return (
    <div className="sidebar">

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

      {/* Logout Button - at the bottom */}
      <div className="sidebar-spacer" />
      <div
        className="sidebar-icon-box logout-btn"
        onClick={handleLogout}
      >
        <LogoutOutlined className="sidebar-icon" />
      </div>
    </div>
  );
};

export default Sidebar;

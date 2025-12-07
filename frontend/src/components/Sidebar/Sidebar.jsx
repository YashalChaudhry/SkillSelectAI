import React from "react";
import { PersonOutline, WorkOutline } from "@mui/icons-material";
import "./Sidebar.css";

const Sidebar = ({ activePage, setActivePage }) => {

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
    </div>
  );
};

export default Sidebar;

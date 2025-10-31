import React from "react";
import { NavLink } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import AssignmentIcon from "@mui/icons-material/Assignment";
import QuizIcon from "@mui/icons-material/Quiz";
import PeopleIcon from "@mui/icons-material/People";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import GridViewIcon from "@mui/icons-material/GridView";
import "../pages/style.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, path: "/instructor/dashboard" },
  { id: "courses", label: "Courses", icon: <SchoolIcon />, path: "/instructor/courses" },
  { id: "classes", label: "Classes", icon: <PeopleIcon />, path: "/instructor/classes" },
  { id: "assignments", label: "Assignments", icon: <AssignmentIcon />, path: "/instructor/assignments" },
  { id: "exams", label: "Exams", icon: <QuizIcon />, path: "/instructor/exams" },
  { id: "grades", label: "Grades", icon: <AssessmentIcon />, path: "/instructor/grades" },
  { id: "settings", label: "Settings", icon: <SettingsIcon />, path: "/instructor/settings" },
];

export function InstructorSidebar() {
  return (
    <div className="instructor-sidebar">
      {/* LOGO */}
      <div className="sidebar-header">
        <div className="sidebar-header-icon">
          <GridViewIcon sx={{ fontSize: 24 }} />
        </div>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>ATPS</h3>
      </div>

      {/* NAV LIST */}
      <div className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

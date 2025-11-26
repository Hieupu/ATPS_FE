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
import RequestPageIcon from "@mui/icons-material/RequestPage";
import "../pages/style.css";

const navItems = [
  {
    id: "dashboard",
    label: "Trang chủ",
    icon: <DashboardIcon />,
    path: "/instructor/dashboard",
  },
  {
    id: "courses",
    label: "Khóa học",
    icon: <SchoolIcon />,
    path: "/instructor/courses",
  },
  {
    id: "classes",
    label: "Lớp học",
    icon: <PeopleIcon />,
    path: "/instructor/classes",
  },
  {
    id: "assignments",
    label: "Bài tập",
    icon: <AssignmentIcon />,
    path: "/instructor/assignments",
  },
  {
    id: "exams",
    label: "Bài kiểm tra",
    icon: <QuizIcon />,
    path: "/instructor/exams",
  },
  {
    id: "grades",
    label: "Điểm số",
    icon: <AssessmentIcon />,
    path: "/instructor/grades",
  },

  {
    id: "schedule",
    label: "Thời khóa biểu",
    icon: <RequestPageIcon />,
    path: "/instructor/schedule",
  },

  {
    id: "settings",
    label: "Cài đặt",
    icon: <SettingsIcon />,
    path: "/instructor/settings",
  },
];

export function InstructorSidebar() {
  return (
    <div className="instructor-sidebar">
      {/* LOGO */}
      <NavLink to="/" className="sidebar-header-link">
        <div className="sidebar-header">
          <div className="sidebar-header-icon">
            <GridViewIcon sx={{ fontSize: 24 }} />
          </div>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>
            ATPS
          </h3>
        </div>
      </NavLink>

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

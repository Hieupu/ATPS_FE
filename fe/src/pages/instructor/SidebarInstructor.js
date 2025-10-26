import React, { useState } from "react"
import DashboardIcon from "@mui/icons-material/Dashboard"
import SchoolIcon from "@mui/icons-material/School"
import AssignmentIcon from "@mui/icons-material/Assignment"
import QuizIcon from "@mui/icons-material/Quiz"
import PeopleIcon from "@mui/icons-material/People"
import AssessmentIcon from "@mui/icons-material/Assessment"
import SettingsIcon from "@mui/icons-material/Settings"
import GridViewIcon from "@mui/icons-material/GridView"

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
  { id: "courses", label: "Courses", icon: <SchoolIcon /> },
  { id: "classes", label: "Classes", icon: <PeopleIcon /> },
  { id: "assignments", label: "Assignments", icon: <AssignmentIcon /> },
  { id: "exams", label: "Exams", icon: <QuizIcon /> },
  { id: "grades", label: "Grades", icon: <AssessmentIcon /> },
  { id: "settings", label: "Settings", icon: <SettingsIcon /> },
]

const linkStyle = {
  color: "#64748b",
  padding: "12px 15px",
  marginBottom: "8px",
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  textDecoration: "none",
  fontWeight: 500,
  transition: "all 0.3s ease",
  cursor: "pointer",
  border: "none",
  backgroundColor: "transparent",
  fontSize: "14px",
  gap: "12px",
  width: "100%",
}

const activeLinkStyle = {
  backgroundColor: "#5b5bff",
  color: "#fff",
}

const hoverStyle = {
  backgroundColor: "#e2e8f0",
  color: "#1e293b",
}

export function InstructorSidebar({ activeNav, onNavChange }) {
  const [hoveredItem, setHoveredItem] = useState(null)

  const StyledNavLink = ({ id, icon, children }) => {
    const isActive = activeNav === id
    const isHovered = hoveredItem === id

    return (
      <button
        style={{
          ...linkStyle,
          ...(isActive ? activeLinkStyle : {}),
          ...(isHovered && !isActive ? hoverStyle : {}),
        }}
        onMouseEnter={() => setHoveredItem(id)}
        onMouseLeave={() => setHoveredItem(null)}
        onClick={() => onNavChange(id)}
      >
        <span style={{ display: "flex", alignItems: "center", fontSize: "18px" }}>{icon}</span>
        {children}
      </button>
    )
  }

  return (
    <div
      style={{
        width: "250px",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        color: "#1e293b",
        padding: "20px 15px",
        display: "flex",
        flexDirection: "column",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 1000,
        borderRight: "1px solid #e2e8f0",
      }}
    >
      {/* LOGO */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          marginBottom: "30px",
          paddingBottom: "20px",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            backgroundColor: "#5b5bff",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "20px",
          }}
        >
          <GridViewIcon sx={{ fontSize: 24 }} />
        </div>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>Academy</h3>
      </div>

      {/* NAV ITEMS */}
      <div style={{ flex: 1 }}>
        {navItems.map((item) => (
          <StyledNavLink key={item.id} id={item.id} icon={item.icon}>
            {item.label}
          </StyledNavLink>
        ))}
      </div>
    </div>
  )
}

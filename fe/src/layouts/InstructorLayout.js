import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { INSTRUCTOR_ROUTES } from "../router/router";
import "./InstructorLayout.css";

const InstructorLayout = () => {
  const location = useLocation();

  const navigationItems = [
    {
      path: INSTRUCTOR_ROUTES.DASHBOARD,
      label: "Dashboard",
      icon: "fas fa-chart-bar",
      description: "Tổng quan công việc",
    },
    {
      path: INSTRUCTOR_ROUTES.COURSE_MANAGEMENT,
      label: "Quản lý khóa học",
      icon: "fas fa-graduation-cap",
      description: "Tạo và quản lý khóa học",
    },
    {
      path: INSTRUCTOR_ROUTES.CLASS_ASSIGNMENT,
      label: "Quản lý lớp học",
      icon: "fas fa-school",
      description: "Tạo và quản lý lớp học với khóa học",
    },
  ];

  const isActiveRoute = (path) => {
    if (path === INSTRUCTOR_ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="instructor-layout">
      {/* Header */}
      <header className="instructor-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="header-title">
              <span className="header-icon">
                <i className="fas fa-chalkboard-teacher"></i>
              </span>
              Instructor Dashboard
            </h1>
            <p className="header-subtitle">Quản lý khóa học và lớp học</p>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-avatar">
                <i className="fas fa-user"></i>
              </span>
              <span className="user-name">Nguyễn Văn A</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="instructor-nav">
        <div className="nav-content">
          <ul className="nav-list">
            {navigationItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${
                    isActiveRoute(item.path) ? "active" : ""
                  }`}
                >
                  <span className="nav-icon">
                    <i className={item.icon}></i>
                  </span>
                  <div className="nav-text">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="instructor-main">
        <div className="main-content">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="instructor-footer">
        <div className="footer-content">
          <p>&copy; 2025 ATPS - Advanced Training Platform System</p>
          <p>Instructor Portal - Quản lý khóa học và lớp học</p>
        </div>
      </footer>
    </div>
  );
};

export default InstructorLayout;

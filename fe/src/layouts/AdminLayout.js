import React, { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { ADMIN_ROUTES } from "../router/router";
import "./AdminLayout.css";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const menuItems = [
    {
      path: ADMIN_ROUTES.DASHBOARD,
      icon: "📊",
      label: "Dashboard",
      description: "Tổng quan hệ thống",
    },
    {
      path: ADMIN_ROUTES.CLASS_MANAGEMENT,
      icon: "📚",
      label: "Quản lý lớp học",
      description: "Quản lý lớp học và lịch trình",
    },
    {
      path: ADMIN_ROUTES.COURSES,
      icon: "📖",
      label: "Quản lý khóa học",
      description: "Quản lý nội dung khóa học",
    },
    {
      path: ADMIN_ROUTES.INSTRUCTORS,
      icon: "🧑‍🏫",
      label: "Quản lý giảng viên",
      description: "Quản lý đội ngũ giảng viên",
    },
    {
      path: ADMIN_ROUTES.LEARNERS,
      icon: "👥",
      label: "Quản lý học viên",
      description: "Quản lý học viên",
    },
    {
      path: ADMIN_ROUTES.REPORTS,
      icon: "📈",
      label: "Báo cáo",
      description: "Thống kê và báo cáo",
    },
  ];

  const isActive = (path) => {
    if (path === ADMIN_ROUTES.DASHBOARD) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            {sidebarOpen && <span className="logo-text">ATPS Admin</span>}
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? "active" : ""}`}
              title={item.description}
            >
              <span className="nav-icon">{item.icon}</span>
              {sidebarOpen && (
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            title={sidebarOpen ? "Thu gọn" : "Mở rộng"}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Bar */}
        <header className="top-bar">
          <div className="top-bar-left">
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <h2 className="page-breadcrumb">
              {menuItems.find((item) => isActive(item.path))?.label || "Admin"}
            </h2>
          </div>
          <div className="top-bar-right">
            <div className="user-info">
              <span className="user-avatar">👤</span>
              <span className="user-name">Admin User</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="content-footer">
          <p>© 2025 ATPS - Hệ thống Quản lý Đào tạo An toàn Thông tin</p>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;

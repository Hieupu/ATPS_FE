import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import ClassManagementPage from "./pages/admin/ClassManagementPage/ClassManagementPage";
import ScheduleManagementPage from "./pages/admin/ScheduleManagementPage/ScheduleManagementPage";
import { ADMIN_ROUTES } from "./routingLayer/routes";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to admin dashboard */}
        <Route
          path="/"
          element={<Navigate to={ADMIN_ROUTES.DASHBOARD} replace />}
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="classes" element={<ClassManagementPage />} />
          <Route
            path="classes/:courseId/schedule"
            element={<ScheduleManagementPage />}
          />
          {/* Thêm các route admin khác ở đây */}
        </Route>

        {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

// Temporary Dashboard Component
function AdminDashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>📊 Dashboard Admin</h1>
      <p>Chào mừng đến với hệ thống quản lý đào tạo ATPS!</p>
      <div style={{ marginTop: "20px" }}>
        <a
          href="/admin/classes"
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block",
          }}
        >
          📚 Quản lý lớp học
        </a>
      </div>
    </div>
  );
}

// 404 Component
function NotFound() {
  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1 style={{ fontSize: "72px", margin: "0" }}>404</h1>
      <p style={{ fontSize: "24px", color: "#6c757d" }}>Không tìm thấy trang</p>
      <a
        href="/"
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          background: "#667eea",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
          display: "inline-block",
        }}
      >
        🏠 Về trang chủ
      </a>
    </div>
  );
}

export default App;

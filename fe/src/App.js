import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import InstructorLayout from "./layouts/InstructorLayout";
import ClassManagementPage from "./pages/admin/ClassManagementPage/ClassManagementPage";
import ScheduleManagementPage from "./pages/admin/ScheduleManagementPage/ScheduleManagementPage";
import CourseManagementPage from "./pages/instructor/CourseManagementPage/CourseManagementPage";
import InstructorClassManagementPage from "./pages/instructor/ClassManagementPage/ClassManagementPage";
import { ADMIN_ROUTES } from "./router/router";
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
            path="classes/:classId/schedule"
            element={<ScheduleManagementPage />}
          />
          {/* <Route path="sessions/:sessionId/timeslots" element={<SessionTimeslotAssignmentPage />} /> */}
        </Route>

        {/* Instructor Routes */}
        <Route path="/instructor" element={<InstructorLayout />}>
          <Route index element={<InstructorDashboard />} />
          {/* Instructor Course Management Routes */}
          <Route path="courses" element={<CourseManagementPage />} />
          <Route path="classes" element={<InstructorClassManagementPage />} />
          {/* <Route path="classes/:classId/sessions" element={<SessionManagementPage />} /> */}
          {/* <Route path="courses/:courseId/materials" element={<MaterialManagementPage />} /> */}
          {/* <Route path="sessions/:sessionId/lessons" element={<LessonManagementPage />} /> */}
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
      <h1>Dashboard Admin</h1>
      <p>Chào mừng đến với ATPS!</p>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
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
          Quản lý lớp học
        </a>
      </div>
    </div>
  );
}

// Temporary Instructor Dashboard Component
function InstructorDashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Dashboard Instructor</h1>
      <p>Chào mừng đến với portal giảng viên ATPS!</p>
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/instructor/courses"
          style={{
            padding: "12px 24px",
            background: "#667eea",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block",
          }}
        >
          Quản lý khóa học
        </a>
        <a
          href="/instructor/classes"
          style={{
            padding: "12px 24px",
            background: "#28a745",
            color: "white",
            textDecoration: "none",
            borderRadius: "8px",
            display: "inline-block",
          }}
        >
          Lớp được gán
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
        Về trang chủ
      </a>
    </div>
  );
}

export default App;

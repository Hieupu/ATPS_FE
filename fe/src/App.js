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
import { PUBLIC_ROUTES } from "./routingLayer/routes";
import "./App.css";
import LoginPage from "./pages/common/Login/LoginPage";
import HomePage from "./pages/common/HomePage/HomePage";
import ForgotPassword from "./pages/common/ForgotPassword/ForgotPassword";
import RegisterPage from "./pages/common/Register/RegisterPage";
import OAuthCallback from "./pages/common/AuthCallback/OAuthCallback";
import MyProfile from "./pages/MyProfile/MyProfile";
import CoursesPage from "./pages/course/CoursesPage";
import CourseDetailPage from "./pages/course/CourseDetailPage";
import MyCourses from "./pages/course/MyCourses";
import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";
import InstructorLayout from "./layouts/InstructorLayout";
import InstructorDashboard from "./pages/instructor/pages/DashboardPage";
import InstructorCourses from "./pages/instructor/pages/CoursesPage";
import InstructorClasses from "./pages/instructor/pages/ClassesPage";
import ClassDetail from "./pages/instructor/pages/ClassDetail";
import InstructorAssignments from "./pages/instructor/pages/AssignmentsPage";
import InstructorExams from "./pages/instructor/pages/ExamsPage";
import InstructorGrades from "./pages/instructor/pages/GradesPage";
import InstructorSettings from "./pages/instructor/pages/SettingsPage";
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";

import InstructorsPage from "./pages/instructor/InstructorsPage";
import InstructorDetailPage from "./pages/instructor/InstructorDetailPage";

import SchedulePage from "./pages/schedule/SchedulePage";
import AttendancePage from "./pages/attendance/AttendancePage";
import ProgressPage from "./pages/progress/ProgressPage";
import MaterialsPage from "./pages/materials/MaterialsPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path={PUBLIC_ROUTES.HOME} element={<HomePage />} />
          <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />

          <Route
            path={PUBLIC_ROUTES.FORGOTPASSWORD}
            element={<ForgotPassword />}
          />

          <Route path="/profile" element={<MyProfile />} />

          <Route path={PUBLIC_ROUTES.REGISTER} element={<RegisterPage />} />
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route
            path="/register"
            element={<Navigate to={PUBLIC_ROUTES.REGISTER} replace />}
          />

          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/payment-failed" element={<PaymentFailedPage />} />

          <Route path="/instructors" element={<InstructorsPage />} />
          <Route path="/instructors/:id" element={<InstructorDetailPage />} />

          {/* Learner-specific Routes */}
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/attendance" element={<AttendancePage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/materials" element={<MaterialsPage />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="classes" element={<ClassManagementPage />} />
            <Route
              path="classes/:courseId/schedule"
              element={<ScheduleManagementPage />}
            />
          </Route>
          {/* Instructor Routes */}
          <Route element={<RequireAuth allowedRoles={["instructor"]} />}>
            <Route path="/instructor" element={<InstructorLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<InstructorDashboard />} />
              <Route path="courses" element={<InstructorCourses />} />
              <Route path="classes" element={<InstructorClasses />} />
              <Route path="classes/detail" element={<ClassDetail />} />
              <Route path="assignments" element={<InstructorAssignments />} />
              <Route path="exams" element={<InstructorExams />} />
              <Route path="grades" element={<InstructorGrades />} />
              <Route path="settings" element={<InstructorSettings />} />
            </Route>
          </Route>
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
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

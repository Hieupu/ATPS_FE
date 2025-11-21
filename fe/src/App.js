import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import DashboardPage from "./pages/admin/pages/DashboardPage";
import ClassesPage from "./pages/admin/pages/ClassesPage";
import CreateClassPage from "./pages/admin/pages/CreateClassPage";
import InstructorsPage from "./pages/admin/pages/InstructorsPage";
import LearnersPage from "./pages/admin/pages/LearnersPage";
import AdminReportsPage from "./pages/admin/pages/ReportsPage";
import RevenueReportsPage from "./pages/admin/pages/RevenueReportsPage";
import LearnerReportsPage from "./pages/admin/pages/LearnerReportsPage";
import ClassReportsPage from "./pages/admin/pages/ClassReportsPage";
import StaffReportsPage from "./pages/admin/pages/StaffReportsPage";
import SchedulePage from "./pages/admin/pages/SchedulePage";
import NewsPage from "./pages/admin/pages/NewsPage";
import AdminCoursesPage from "./pages/admin/pages/CoursesPage";
import RefundPage from "./pages/admin/pages/RefundPage";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "./routingLayer/routes";
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
import InstructorDashboardPage from "./pages/instructor/pages/DashboardPage";
import InstructorCoursesPage from "./pages/instructor/pages/CoursesPage";
import InstructorClassesPage from "./pages/instructor/pages/ClassesPage";
import InstructorAssignmentsPage from "./pages/instructor/pages/AssignmentsPage";
import InstructorExamsPage from "./pages/instructor/pages/ExamsPage";
import InstructorGradesPage from "./pages/instructor/pages/GradesPage";
import InstructorSettingsPage from "./pages/instructor/pages/SettingsPage";
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";

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

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="classes/new" element={<CreateClassPage />} />
            <Route path="courses" element={<AdminCoursesPage />} />
            <Route path="instructors" element={<InstructorsPage />} />
            <Route path="learners" element={<LearnersPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="news" element={<NewsPage />} />
            <Route
              path="classes/:courseId/schedule"
              element={<SchedulePage />}
            />
            {/* Statistics Routes */}
            <Route
              path="statistics/revenue"
              element={<RevenueReportsPage />}
            />
            <Route
              path="statistics/learners"
              element={<LearnerReportsPage />}
            />
            <Route
              path="statistics/classes"
              element={<ClassReportsPage />}
            />
            <Route path="statistics/staff" element={<StaffReportsPage />} />
            {/* User Management Routes */}
            <Route path="users/learners" element={<LearnersPage />} />
            <Route path="users/instructors" element={<InstructorsPage />} />
            <Route path="users/staff" element={<InstructorsPage />} />
            <Route path="users/admins" element={<InstructorsPage />} />
            <Route path="users/create" element={<InstructorsPage />} />
            {/* Class & Schedule Routes */}
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="instructor-calendar" element={<SchedulePage />} />
            <Route path="instructor-leave" element={<SchedulePage />} />
            {/* Finance Routes */}
            <Route path="finance/payment-history" element={<AdminReportsPage />} />
            <Route path="finance/refunds" element={<RefundPage />} />
            <Route path="finance/promotions" element={<AdminReportsPage />} />
            <Route path="finance/payroll" element={<AdminReportsPage />} />
            {/* System Routes */}
            <Route path="system/payment-gateways" element={<AdminReportsPage />} />
            <Route path="system/notification-templates" element={<AdminReportsPage />} />
            <Route path="system/timeslots" element={<SchedulePage />} />
          </Route>
          {/* Instructor Routes */}
          {/* <Route element={<RequireAuth allowedRoles={["instructor"]} />}> */}
          <Route path="/instructor" element={<InstructorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<InstructorDashboardPage />} />
            <Route path="courses" element={<InstructorCoursesPage />} />
            <Route path="classes" element={<InstructorClassesPage />} />
            <Route path="assignments" element={<InstructorAssignmentsPage />} />
            <Route path="exams" element={<InstructorExamsPage />} />
            <Route path="grades" element={<InstructorGradesPage />} />
            <Route path="settings" element={<InstructorSettingsPage />} />
          </Route>
          {/* </Route> */}
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
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

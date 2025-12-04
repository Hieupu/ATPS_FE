import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
import MyCourseDetailPage from "./pages/course/MyCourseDetailPage";

import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";
import PaymentHistoryPage from "./pages/payment/PaymentHistoryPage";

import InstructorLayout from "./layouts/InstructorLayout";
import InstructorDashboard from "./pages/instructor/pages/DashboardPage";
import InstructorClasses from "./pages/instructor/pages/ClassesPage";
import ClassDetailPage from "./pages/instructor/pages/ClassDetailPage";
import InstructorAssignments from "./pages/instructor/pages/AssignmentsPage";
import InstructorExams from "./pages/instructor/pages/ExamsPage";
import InstructorGrades from "./pages/instructor/pages/GradesPage";
import InstructorSettings from "./pages/instructor/pages/SettingsPage";
import CoursesPagee from "./pages/instructor/pages/CoursesPage";
import CourseBuilderPage from "./pages/instructor/pages/CourseBuilderPage";
import InstructorSchedulePage from "./pages/instructor/pages/InstructorSchedulePage";

import InstructorsPage from "./pages/instructor/InstructorsPage";
import InstructorDetailPage from "./pages/instructor/InstructorDetailPage";

import SchedulePage from "./pages/schedule/SchedulePage";
import RescheduleRequestsPage from "./pages/schedule/RescheduleRequestsPage";
import AttendancePage from "./pages/attendance/AttendancePage";
import ProgressPage from "./pages/progress/ProgressPage";
import MaterialsPage from "./pages/materials/MaterialsPage";

import ZoomMeetingPage from "./pages/schedule/ZoomMeetingPage";

import ExamsPage from "./pages/exam/ExamsPage";
import ExamTakingPage from "./pages/exam/ExamTakingPage";      
import ExamResultPage from "./pages/exam/ExamResultPage";   
import AssignmentsPage from "./pages/assignment/AssignmentsPage";

import { AuthProvider, RequireAuth } from "./contexts/AuthContext";
import { useTokenExpiry } from "./hooks/useTokenExpiry";

// ⭐ Các route mới từ nhánh của bạn
import CreateExamPage from "./pages/instructor/components/exam/CreateExamPage";
import EditExamPage from "./pages/instructor/components/exam/EditExamPage";

function AppRoutes() {
  useTokenExpiry();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path={PUBLIC_ROUTES.HOME} element={<HomePage />} />
      <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={PUBLIC_ROUTES.FORGOTPASSWORD} element={<ForgotPassword />} />
      <Route path={PUBLIC_ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path="/oauth/callback" element={<OAuthCallback />} />
      <Route path="/profile" element={<MyProfile />} />

      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/courses/:id" element={<CourseDetailPage />} />
      <Route path="/my-courses" element={<MyCourses />} />
      <Route path="/my-courses/:id" element={<MyCourseDetailPage />} />

      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/payment-failed" element={<PaymentFailedPage />} />
      <Route path="/paymenthistory" element={<PaymentHistoryPage />} />

      <Route path="/instructors" element={<InstructorsPage />} />
      <Route path="/instructors/:id" element={<InstructorDetailPage />} />

      <Route path="/assignments" element={<AssignmentsPage />} />
      <Route path="/exam" element={<ExamsPage />} />
      <Route path="/exam/:examId/take" element={<ExamTakingPage />} />
      <Route path="/exam/:examId/result" element={<ExamResultPage />} />

      {/* Learner Routes */}
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/reschedule-requests" element={<RescheduleRequestsPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route
        path="/zoom/:zoomId?/:zoomPass?"
        element={<ZoomMeetingPage />}
      />
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

          <Route path="courses" element={<CoursesPagee />} />
          <Route path="courses/:courseId" element={<CourseBuilderPage />} />

          <Route path="classes" element={<InstructorClasses />} />
          <Route path="classes/:classId" element={<ClassDetailPage />} />

          <Route path="assignments" element={<InstructorAssignments />} />
          <Route path="exams" element={<InstructorExams />} />
          <Route path="grades" element={<InstructorGrades />} />
          <Route path="schedule" element={<InstructorSchedulePage />} />
          <Route path="settings" element={<InstructorSettings />} />
          <Route path="exams/create" element={<CreateExamPage />} />
          <Route path="exams/edit/:examId" element={<EditExamPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer
          position="top-right"
          autoClose={2500}
          pauseOnHover
          closeOnClick
          newestOnTop={false}
          theme="colored"
        />
      </Router>
    </AuthProvider>
  );
}

// Admin Dashboard
function AdminDashboard() {
  return (
    <div style={{ padding: "24px" }}>
      <h1>Dashboard Admin</h1>
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
          }}
        >
          Quản lý lớp học
        </a>
      </div>
    </div>
  );
}

// Not Found
function NotFound() {
  return (
    <div
      style={{
        padding: "60px 20px",
        textAlign: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <h1 style={{ fontSize: "72px", margin: 0 }}>404</h1>
      <p style={{ fontSize: "24px", color: "#6c757d" }}>
        Không tìm thấy trang
      </p>
      <a
        href="/"
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          background: "#667eea",
          color: "white",
          textDecoration: "none",
          borderRadius: "8px",
        }}
      >
        Về trang chủ
      </a>
    </div>
  );
}

export default App;

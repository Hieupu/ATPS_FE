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
import DashboardPage from "./pages/admin/pages/DashboardPage";
import ClassesPage from "./pages/admin/pages/ClassesPage";
import CreateClassPage from "./pages/admin/pages/CreateClassPage";
import InstructorsPageAdmin from "./pages/admin/pages/InstructorsPage";
import LearnersPage from "./pages/admin/pages/LearnersPage";
import StaffPage from "./pages/admin/pages/StaffPage";
import AdminsPage from "./pages/admin/pages/AdminsPage";
import AdminReportsPage from "./pages/admin/pages/ReportsPage";
import RevenueReportsPage from "./pages/admin/pages/RevenueReportsPage";
import LearnerReportsPage from "./pages/admin/pages/LearnerReportsPage";
import ClassReportsPage from "./pages/admin/pages/ClassReportsPage";
import StaffReportsPage from "./pages/admin/pages/StaffReportsPage";
import SchedulePageAdmin from "./pages/admin/pages/SchedulePage";
import InstructorLeavePage from "./pages/admin/pages/InstructorLeavePage";
import InstructorSchedulePageAdmin from "./pages/admin/pages/InstructorSchedulePage";
import InstructorCertificatesPage from "./pages/admin/pages/InstructorCertificatesPage";
import SessionChangeRequestsPage from "./pages/admin/pages/SessionChangeRequestsPage";
import TimeslotManagerPage from "./pages/admin/pages/TimeslotManagerPage";
import NewsPage from "./pages/admin/pages/NewsPage";
import AdminCoursesPage from "./pages/admin/pages/CoursesPage";
import RefundPage from "./pages/admin/pages/RefundPage";
import PromotionsPage from "./pages/admin/pages/PromotionsPage";
import EmailTemplatePage from "./pages/admin/pages/EmailTemplatePage";
import EmailLogPage from "./pages/admin/pages/EmailLogPage";
import PayrollPage from "./pages/admin/pages/PayrollPage";
import PaymentHistoryAdminPage from "./pages/admin/pages/PaymentHistoryAdminPage";
import { ADMIN_ROUTES, PUBLIC_ROUTES } from "./routingLayer/routes";
import "./App.css";
import AdminInstructorsPage from "./pages/admin/pages/InstructorsPage";
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
import ClassSchedulePage from "./pages/course/ClassSchedulePage";

import PaymentSuccessPage from "./pages/payment/PaymentSuccessPage";
import PaymentFailedPage from "./pages/payment/PaymentFailedPage";
import PaymentHistoryPage from "./pages/payment/PaymentHistoryPage";

import InstructorLayout from "./layouts/InstructorLayout";
import InstructorDashboard from "./pages/instructor/pages/DashboardPage";
import InstructorClasses from "./pages/instructor/pages/ClassesPage";
import ClassDetailPage from "./pages/instructor/pages/ClassDetailPage";

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
import ExamReviewPage from "./pages/exam/ExamReviewPage";


import InstructorDashboardPage from "./pages/instructor/pages/DashboardPage";
import InstructorCoursesPage from "./pages/instructor/pages/CoursesPage";
import InstructorClassesPage from "./pages/instructor/pages/ClassesPage";

import InstructorExamsPage from "./pages/instructor/pages/ExamsPage";
import InstructorGradesPage from "./pages/instructor/pages/GradesPage";
import InstructorSettingsPage from "./pages/instructor/pages/SettingsPage";
import { AuthProvider, RequireAuth } from "./contexts/AuthContext";
import { useTokenExpiry } from "./hooks/useTokenExpiry";

import CreateExamPage from "./pages/instructor/components/exam/CreateExamPage";
import EditExamPage from "./pages/instructor/components/exam/EditExamPage";

import NewsPages from "./pages/new/NewsPage";
import NewsDetailPage from "./pages/new/NewsDetailPage";

import ContactPage from "./pages/common/Contact/ContactPage";
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
      <Route path="/openingCeremony" element={<ClassSchedulePage />} />

      <Route path="/payment-success" element={<PaymentSuccessPage />} />
      <Route path="/payment-failed" element={<PaymentFailedPage />} />
      <Route path="/paymenthistory" element={<PaymentHistoryPage />} />

      <Route path="/instructors" element={<InstructorsPage />} />
      <Route path="/instructors/:id" element={<InstructorDetailPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/assignments" element={<AssignmentsPage />} />
      <Route path="/exam" element={<ExamsPage />} />
      <Route path="/exam/:instanceId/take" element={<ExamTakingPage />} />
      <Route path="/exam/:instanceId/result" element={<ExamResultPage />} />
      <Route path="/exam/:instanceId/review" element={<ExamReviewPage />} />
      {/* Learner Routes */}
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/reschedule-requests" element={<RescheduleRequestsPage />} />
      <Route path="/attendance" element={<AttendancePage />} />
      <Route path="/zoom/:zoomId?/:zoomPass?" element={<ZoomMeetingPage />} />
      <Route path="/progress" element={<ProgressPage />} />
      <Route path="/materials" element={<MaterialsPage />} />

       <Route path="/new" element={<NewsPages />} />
       <Route path="/new/:newsId" element={<NewsDetailPage />} />
      {/* Admin Routes */}
      <Route element={<RequireAuth allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="classes/new" element={<CreateClassPage />} />
          <Route path="classes/edit/:classId" element={<CreateClassPage />} />
          <Route path="courses" element={<AdminCoursesPage />} />
          <Route path="instructors" element={<InstructorsPageAdmin />} />
          <Route path="learners" element={<LearnersPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route
            path="classes/:courseId/schedule"
            element={<SchedulePageAdmin />}
          />
          {/* Statistics Routes */}
          <Route path="statistics/revenue" element={<RevenueReportsPage />} />
          <Route path="statistics/learners" element={<LearnerReportsPage />} />
          <Route path="statistics/classes" element={<ClassReportsPage />} />
          <Route path="statistics/staff" element={<StaffReportsPage />} />
          {/* User Management Routes */}
          <Route path="users/learners" element={<LearnersPage />} />
          <Route path="users/instructors" element={<AdminInstructorsPage />} />
          <Route path="users/staff" element={<StaffPage />} />
          <Route path="users/admins" element={<AdminsPage />} />
          <Route path="users/create" element={<InstructorsPage />} />
          {/* Class & Schedule Routes */}
          <Route path="schedule" element={<SchedulePage />} />
          <Route
            path="instructor-calendar"
            element={<InstructorSchedulePageAdmin />}
          />
          <Route path="instructor-leave" element={<InstructorLeavePage />} />
          <Route
            path="instructor-certificates"
            element={<InstructorCertificatesPage />}
          />
          <Route
            path="session-change-requests"
            element={<SessionChangeRequestsPage />}
          />
          {/* Finance Routes */}
          <Route
            path="finance/payment-history"
            element={<PaymentHistoryAdminPage />}
          />
          <Route path="finance/refunds" element={<RefundPage />} />
          <Route path="finance/promotions" element={<PromotionsPage />} />
          <Route path="finance/payroll" element={<PayrollPage />} />
          {/* System Routes */}
          <Route
            path="system/payment-gateways"
            element={<PaymentHistoryAdminPage />}
          />
          <Route
            path="system/email-templates"
            element={<EmailTemplatePage />}
          />
          <Route path="system/email-logs" element={<EmailLogPage />} />
          <Route path="system/timeslots" element={<TimeslotManagerPage />} />
        </Route>
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

          <Route path="exams" element={<InstructorExams />} />
          <Route path="grades" element={<InstructorGrades />} />
          <Route path="schedule" element={<InstructorSchedulePage />} />
          <Route path="settings" element={<InstructorSettings />} />
          <Route path="exams/create" element={<CreateExamPage />} />
          <Route path="exams/edit/:examId" element={<EditExamPage />} />
        </Route>
      </Route>
      {/* </Route> */}
      {/* 404 Page */}
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
        }}
      >
        Về trang chủ
      </a>
    </div>
  );
}

export default App;

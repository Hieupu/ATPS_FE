// Danh sách route constants

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  CLASS_MANAGEMENT: "/admin/classes",
  SCHEDULE_MANAGEMENT: "/admin/classes/:courseId/schedule",
  USERS: "/admin/users",
  COURSES: "/admin/courses",
  INSTRUCTORS: "/admin/instructors",
  LEARNERS: "/admin/learners",
  REPORTS: "/admin/reports",
};

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  ABOUT: "/about",
  CONTACT: "/contact",
  FORGOTPASSWORD:"/forgot-password"
};

// Instructor Routes
export const INSTRUCTOR_ROUTES = {
  DASHBOARD: "/instructor",
  CLASSES: "/instructor/classes",
  STUDENTS: "/instructor/students",
  ASSIGNMENTS: "/instructor/assignments",
};

// Learner Routes
export const LEARNER_ROUTES = {
  DASHBOARD: "/learner",
  MY_CLASSES: "/learner/classes",
  ASSIGNMENTS: "/learner/assignments",
  GRADES: "/learner/grades",
};

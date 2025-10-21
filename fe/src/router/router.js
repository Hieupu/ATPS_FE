// Danh sách route constants

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: "/admin",
  CLASS_MANAGEMENT: "/admin/classes",
  SESSION_TIMESLOT_ASSIGNMENT: "/admin/sessions/:sessionId/timeslots",
  CLASS_SCHEDULE: "/admin/classes/:classId/schedule",
  USERS: "/admin/users",
  INSTRUCTORS: "/admin/instructors",
  LEARNERS: "/admin/learners",
  REPORTS: "/admin/reports",
};

// Public Routes
export const PUBLIC_ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  ABOUT: "/about",
  CONTACT: "/contact",
};

// Instructor Routes
export const INSTRUCTOR_ROUTES = {
  DASHBOARD: "/instructor",
  COURSE_MANAGEMENT: "/instructor/courses",
  CLASS_ASSIGNMENT: "/instructor/classes",
  SESSION_MANAGEMENT: "/instructor/classes/:classId/sessions",
  MATERIAL_MANAGEMENT: "/instructor/courses/:courseId/materials",
  LESSON_MANAGEMENT: "/instructor/sessions/:sessionId/lessons",
};

// Learner Routes
export const LEARNER_ROUTES = {
  DASHBOARD: "/learner",
  MY_CLASSES: "/learner/classes",
  SCHEDULE: "/learner/schedule",
  COURSE_MATERIALS: "/learner/courses/:courseId/materials",
  SESSION_LESSONS: "/learner/sessions/:sessionId/lessons",
};

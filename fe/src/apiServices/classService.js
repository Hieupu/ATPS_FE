// Service quản lý lớp học theo luồng đúng của dự án
// Admin tạo lớp và lịch học cho instructor
// Instructor tự thêm khóa học và tài liệu
// Học viên enroll khóa học (không phải lớp) và tính giá theo khóa học
// Lớp không giới hạn số sinh viên

import apiClient from "./apiClient";
import { formatDateForAPI } from "../utils/dateUtils";

// API Methods theo luồng đúng - Kết nối với Backend
const classService = {
  // ========== ADMIN FUNCTIONS ==========

  // Admin: Lấy danh sách lớp học với thông tin đầy đủ
  getAllClassesWithDetails: async (params = {}) => {
    try {
      // Build query string for pagination and filters
      const queryString = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 10,
        ...params,
      }).toString();

      const result = await apiClient.get(
        `/admin/classes/details?${queryString}`
      );

      // Backend mới trả về format: { success, message, data, pagination }
      const rawData = result.data || [];

      // Transform backend data to frontend format
      const transformClassData = (backendClass) => {
        return {
          ClassID: backendClass.ClassID,
          ClassName: backendClass.ClassName,
          ZoomURL: backendClass.ZoomURL,
          Status: backendClass.Status,
          CourseID: backendClass.CourseID,
          InstructorID: backendClass.InstructorID,
          StartDate: backendClass.StartDate,
          EndDate: backendClass.EndDate,
          // Copy schedule data
          schedule: backendClass.schedule || [],
          // Transform Course data
          Course: {
            CourseID: backendClass.CourseID,
            Title: backendClass.courseTitle || backendClass.Course?.Title,
            Description:
              backendClass.courseDescription ||
              backendClass.Course?.Description,
            Duration:
              backendClass.courseDuration || backendClass.Course?.Duration,
            TuitionFee:
              parseFloat(
                backendClass.courseTuitionFee || backendClass.Course?.TuitionFee
              ) || 0,
            Status: backendClass.courseStatus || backendClass.Course?.Status,
          },
          // Transform Instructor data
          Instructor: {
            InstructorID: backendClass.InstructorID,
            FullName:
              backendClass.instructorName || backendClass.Instructor?.FullName,
            Major:
              backendClass.instructorMajor || backendClass.Instructor?.Major,
            Email:
              backendClass.instructorEmail || backendClass.Instructor?.Email,
          },
          // Transform Enrolled Students
          EnrolledStudents:
            backendClass.enrollments || backendClass.EnrolledStudents || [],
          // Keep original data for reference
          _original: backendClass,
        };
      };

      const classesData = Array.isArray(rawData)
        ? rawData.map(transformClassData)
        : [];

      // Return with pagination info
      return {
        data: classesData,
        pagination: result.pagination,
      };
    } catch (error) {
      // Fallback to mock data if backend not ready
      return {
        data: [
          {
            ClassID: 1,
            ClassName: "Lớp Lập trình Web 01",
            ZoomURL: "https://zoom.us/j/123456789",
            Status: "Sắp khai giảng",
            CourseID: 1,
            InstructorID: 1,
            StartDate: "2024-01-15",
            EndDate: "2024-03-15",
            Course: {
              CourseID: 1,
              Title: "Lập trình Web",
              Description: "Khóa học lập trình web cơ bản",
              TuitionFee: 2000000,
            },
            Instructor: {
              InstructorID: 1,
              FullName: "Nguyễn Văn A",
              Major: "Công nghệ thông tin",
            },
            EnrolledStudents: [
              {
                LearnerID: 1,
                FullName: "Trần Thị B",
              },
            ],
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };
    }
  },

  // Admin: Tạo lớp học mới (gán cho instructor)
  createClass: async (classData) => {
    try {
      const result = await apiClient.post("/admin/classes", classData);

      // Backend mới trả về format: { success, message, data }
      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo lớp học thành công",
      };
    } catch (error) {
      // Handle backend validation errors
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }

      throw error;
    }
  },

  // Admin: Lấy thông tin lớp học theo ID
  getClassById: async (classId) => {
    try {
      const result = await apiClient.get(`/admin/classes/${classId}`);
      return result.data;
    } catch (error) {
      // Fallback to mock data if backend not ready
      return {
        ClassID: parseInt(classId),
        ClassName: "Lớp Lập trình Web 01",
        ZoomURL: "https://zoom.us/j/123456789",
        Status: "Sắp khai giảng",
        CourseID: 1,
        InstructorID: 1,
        StartDate: "2024-01-15",
        EndDate: "2024-03-15",
        Course: {
          CourseID: 1,
          Title: "Lập trình Web",
          Description: "Khóa học lập trình web cơ bản",
          TuitionFee: 2000000,
        },
        Instructor: {
          InstructorID: 1,
          FullName: "Nguyễn Văn A",
          Major: "Công nghệ thông tin",
        },
        EnrolledStudents: [
          {
            LearnerID: 1,
            FullName: "Trần Thị B",
          },
        ],
      };
    }
  },

  // Admin: Cập nhật lớp học
  updateClass: async (classId, classData) => {
    try {
      const result = await apiClient.put(
        `/admin/classes/${classId}`,
        classData
      );
      return result;
    } catch (error) {
      throw error;
    }
  },

  // Admin: Xóa lớp học
  deleteClass: async (classId) => {
    return await apiClient.delete(`/admin/classes/${classId}`);
  },

  // Admin: Tạo session mới cho class (SCHEMA MỚI: Session phải có ClassID)
  createAdminSession: async (sessionData) => {
    return await apiClient.post("/admin/sessions", sessionData);
  },

  // Admin: Gán timeslot cho session (SCHEMA MỚI)
  assignTimeslotToSession: async (sessionId, timeslotId) => {
    return await apiClient.post(`/admin/sessions/${sessionId}/timeslots`, {
      TimeslotID: timeslotId,
    });
  },

  // Admin: Tạo timeslot mới
  createTimeslot: async (timeslotData) => {
    return await apiClient.post("/admin/timeslots", timeslotData);
  },

  // Admin: Lấy lịch học của lớp (SCHEMA MỚI: Session thuộc Class)
  getClassSchedule: async (classId) => {
    return await apiClient.get(`/admin/classes/${classId}/schedule`);
  },

  // Admin: Lấy timeslots của lớp (DEPRECATED: Sử dụng getClassSchedule thay thế)
  getTimeslotsByClass: async (classId) => {
    return await apiClient.get(`/admin/timeslots/class/${classId}`);
  },

  // Admin: Cập nhật lịch học
  updateTimeslot: async (timeslotId, timeslotData) => {
    return await apiClient.put(`/admin/timeslots/${timeslotId}`, timeslotData);
  },

  // Admin: Xóa lịch học
  deleteTimeslot: async (timeslotId) => {
    return await apiClient.delete(`/admin/timeslots/${timeslotId}`);
  },

  // Admin: Quản lý đăng ký học viên vào lớp (SCHEMA MỚI: enroll trực tiếp vào Class)
  enrollStudentToClass: async (classId, learnerId) => {
    return await apiClient.post(`/admin/classes/${classId}/enroll`, {
      learnerId,
    });
  },

  // Admin: Hủy đăng ký học viên
  unenrollStudent: async (enrollmentId) => {
    return await apiClient.delete(`/admin/enrollments/${enrollmentId}`);
  },

  // Admin: Lấy danh sách đăng ký của lớp
  getClassEnrollments: async (classId) => {
    return await apiClient.get(`/admin/classes/${classId}/enrollments`);
  },

  // ========== INSTRUCTOR FUNCTIONS ==========

  // Instructor: Tạo khóa học mới
  createCourse: async (courseData) => {
    return await apiClient.post("/instructor/courses", courseData);
  },

  // Instructor: Cập nhật khóa học
  updateCourse: async (courseId, courseData) => {
    return await apiClient.put(`/instructor/courses/${courseId}`, courseData);
  },

  // Instructor: Xóa khóa học
  deleteCourse: async (courseId) => {
    return await apiClient.delete(`/instructor/courses/${courseId}`);
  },

  // Instructor: Lấy danh sách khóa học của instructor
  getCoursesByInstructor: async (instructorId) => {
    return await apiClient.get(
      `/instructor/courses?instructorId=${instructorId}`
    );
  },

  // Instructor: Lấy chi tiết khóa học với units và lessons (SCHEMA MỚI)
  getCourseDetails: async (courseId) => {
    return await apiClient.get(`/instructor/courses/${courseId}`);
  },

  // ========== UNIT & LESSION MANAGEMENT (SCHEMA MỚI) ==========

  // Instructor: Tạo unit mới cho khóa học
  createUnit: async (courseId, unitData) => {
    return await apiClient.post(
      `/instructor/courses/${courseId}/units`,
      unitData
    );
  },

  // Instructor: Cập nhật unit
  updateUnit: async (unitId, unitData) => {
    return await apiClient.put(`/instructor/units/${unitId}`, unitData);
  },

  // Instructor: Xóa unit
  deleteUnit: async (unitId) => {
    return await apiClient.delete(`/instructor/units/${unitId}`);
  },

  // Instructor: Tạo lesson mới cho unit
  createLesson: async (unitId, lessonData) => {
    return await apiClient.post(
      `/instructor/units/${unitId}/lessions`,
      lessonData
    );
  },

  // Instructor: Cập nhật lesson
  updateLesson: async (lessonId, lessonData) => {
    return await apiClient.put(`/instructor/lessions/${lessonId}`, lessonData);
  },

  // Instructor: Xóa lesson
  deleteLesson: async (lessonId) => {
    return await apiClient.delete(`/instructor/lessions/${lessonId}`);
  },

  // ========== SESSION MANAGEMENT (SCHEMA MỚI) ==========

  // Instructor: Tạo session mới cho class (SCHEMA MỚI: Session phải có ClassID)
  createInstructorSession: async (sessionData) => {
    return await apiClient.post("/instructor/sessions", sessionData);
  },

  // Instructor: Cập nhật session
  updateInstructorSession: async (sessionId, sessionData) => {
    return await apiClient.put(
      `/instructor/sessions/${sessionId}`,
      sessionData
    );
  },

  // Instructor: Xóa session
  deleteInstructorSession: async (sessionId) => {
    return await apiClient.delete(`/instructor/sessions/${sessionId}`);
  },

  // Instructor: Lấy danh sách sessions của instructor
  getInstructorSessions: async (instructorId) => {
    return await apiClient.get(
      `/instructor/sessions?instructorId=${instructorId}`
    );
  },

  // Instructor: Gán timeslot cho session
  assignTimeslotToInstructorSession: async (sessionId, timeslotId) => {
    return await apiClient.post(`/instructor/sessions/${sessionId}/timeslots`, {
      TimeslotID: timeslotId,
    });
  },

  // Instructor: Tạo tài liệu cho khóa học
  createMaterial: async (materialData) => {
    return await apiClient.post("/instructor/materials", materialData);
  },

  // Instructor: Cập nhật tài liệu
  updateMaterial: async (materialId, materialData) => {
    return await apiClient.put(
      `/instructor/materials/${materialId}`,
      materialData
    );
  },

  // Instructor: Xóa tài liệu
  deleteMaterial: async (materialId) => {
    return await apiClient.delete(`/instructor/materials/${materialId}`);
  },

  // Instructor: Lấy tài liệu của khóa học
  getMaterialsByCourse: async (courseId) => {
    return await apiClient.get(`/instructor/courses/${courseId}/materials`);
  },

  // Instructor: Cập nhật session
  updateSession: async (sessionId, sessionData) => {
    return await apiClient.put(
      `/instructor/sessions/${sessionId}`,
      sessionData
    );
  },

  // Instructor: Xóa session
  deleteSession: async (sessionId) => {
    return await apiClient.delete(`/instructor/sessions/${sessionId}`);
  },

  // Instructor: Lấy session của khóa học
  getSessionsByCourse: async (courseId) => {
    return await apiClient.get(`/instructor/courses/${courseId}/sessions`);
  },

  // ========== LEARNER FUNCTIONS ==========

  // Learner: Enroll vào lớp học (SCHEMA MỚI: enroll trực tiếp vào Class, không phải Course)
  enrollToClass: async (classId, learnerId) => {
    return await apiClient.post("/learner/enrollments", {
      classId,
      learnerId,
    });
  },

  // Learner: Hủy đăng ký khóa học
  cancelEnrollment: async (enrollmentId) => {
    return await apiClient.delete(`/learner/enrollments/${enrollmentId}`);
  },

  // Learner: Lấy danh sách lớp học có thể enroll (SCHEMA MỚI: enroll trực tiếp vào Class)
  getAvailableClasses: async () => {
    return await apiClient.get("/learner/classes/available");
  },

  // Learner: Lấy danh sách lớp học đã enroll
  getEnrolledClasses: async (learnerId) => {
    return await apiClient.get(`/learner/enrollments?learnerId=${learnerId}`);
  },

  // Learner: Tham gia lớp học cụ thể
  joinClass: async (classId, learnerId) => {
    return await apiClient.post(`/learner/classes/${classId}/join`, {
      learnerId,
    });
  },

  // Learner: Rời khỏi lớp học
  leaveClass: async (classId, learnerId) => {
    return await apiClient.post(`/learner/classes/${classId}/leave`, {
      learnerId,
    });
  },

  // Learner: Lấy lịch học cá nhân (SCHEMA MỚI: Qua sessions của classes đã enroll)
  getPersonalSchedule: async (learnerId) => {
    return await apiClient.get(`/learner/schedule?learnerId=${learnerId}`);
  },

  // Learner: Lấy nội dung khóa học đã đăng ký (SCHEMA MỚI: qua Class)
  getClassContent: async (classId, learnerId) => {
    return await apiClient.get(
      `/learner/classes/${classId}/content?learnerId=${learnerId}`
    );
  },

  // Learner: Lấy tài liệu của lớp học đã đăng ký (SCHEMA MỚI: qua Class)
  getClassMaterials: async (classId, learnerId) => {
    return await apiClient.get(
      `/learner/classes/${classId}/materials?learnerId=${learnerId}`
    );
  },

  // Learner: Lấy units và lessons của lớp học (SCHEMA MỚI)
  getClassUnits: async (classId, learnerId) => {
    return await apiClient.get(
      `/learner/classes/${classId}/units?learnerId=${learnerId}`
    );
  },

  // ========== COMMON FUNCTIONS ==========

  // Lấy thống kê lớp học
  getClassStatistics: async (classId) => {
    return await apiClient.get(`/admin/classes/${classId}/statistics`);
  },

  // Tự động cập nhật trạng thái lớp học
  autoUpdateClassStatus: async () => {
    return await apiClient.post("/admin/classes/auto-update-status");
  },

  // Lấy danh sách giảng viên
  getAllInstructors: async () => {
    try {
      const result = await apiClient.get("/common/courses/instructors");
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      // Fallback to mock data if backend not ready
      return [
        {
          InstructorID: 1,
          FullName: "Nguyễn Văn A",
          Major: "Công nghệ thông tin",
        },
        {
          InstructorID: 2,
          FullName: "Trần Thị B",
          Major: "Khoa học máy tính",
        },
      ];
    }
  },

  // Lấy danh sách học viên
  getAllLearners: async () => {
    try {
      const result = await apiClient.get("/common/learners");
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      // Fallback to empty array if backend not ready
      return [];
    }
  },

  // Lấy thông tin giảng viên theo ID
  getInstructorById: async (instructorId) => {
    return await apiClient.get(`/common/instructors/${instructorId}`);
  },

  // Lấy thông tin học viên theo ID
  getLearnerById: async (learnerId) => {
    return await apiClient.get(`/common/learners/${learnerId}`);
  },

  // Lấy danh sách khóa học
  getAllCourses: async () => {
    try {
      const result = await apiClient.get("/common/courses");
      return Array.isArray(result.data) ? result.data : [];
    } catch (error) {
      // Fallback to mock data if backend not ready
      return [
        {
          CourseID: 1,
          Title: "Lập trình Web",
          Description: "Khóa học lập trình web cơ bản",
          Duration: 60,
          TuitionFee: 2000000,
          Status: "Active",
          InstructorID: 1,
          Instructor: {
            InstructorID: 1,
            FullName: "Nguyễn Văn A",
            Major: "Công nghệ thông tin",
          },
        },
      ];
    }
  },

  // Lấy chi tiết khóa học
  getCourseById: async (courseId) => {
    try {
      const result = await apiClient.get(`/common/courses/${courseId}`);
      return result.data || null;
    } catch (error) {
      return null;
    }
  },

  // ========== COMMON APIs ==========

  // Lấy danh sách sessions
  getAllSessions: async () => {
    return await apiClient.get("/common/sessions");
  },

  // Lấy danh sách timeslots
  getAllTimeslots: async () => {
    return await apiClient.get("/common/timeslots");
  },

  // Lấy lịch học của instructor
  getInstructorSchedule: async (instructorId) => {
    return await apiClient.get(`/common/instructors/${instructorId}/schedule`);
  },

  // ========== SCHEDULE MANAGEMENT APIs ==========

  // Lấy sessions của class
  getClassSessions: async (classId) => {
    try {
      const result = await apiClient.get(`/admin/classes/${classId}/sessions`);
      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },

  // Tạo session cho class
  createClassSession: async (classId, sessionData) => {
    try {
      // Transform frontend format to backend format - safe timezone handling
      const backendData = {
        title:
          sessionData.title || sessionData.Title || `Session ${Date.now()}`,
        description: sessionData.description || sessionData.Description || "",
        timeslots: sessionData.timeslots || [
          {
            date: formatDateForAPI(sessionData.date || sessionData.Date),
            startTime: sessionData.startTime || sessionData.StartTime,
            endTime: sessionData.endTime || sessionData.EndTime,
            location: sessionData.location || sessionData.Location || null,
          },
        ],
      };

      const result = await apiClient.post(
        `/admin/classes/${classId}/sessions`,
        backendData
      );
      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo session thành công",
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }
      throw error;
    }
  },

  // Cập nhật session
  updateClassSession: async (sessionId, sessionData) => {
    try {
      // Transform frontend format to backend format - safe timezone handling
      const backendData = {
        title: sessionData.title || sessionData.Title,
        description: sessionData.description || sessionData.Description || "",
        timeslots: sessionData.timeslots || [
          {
            date: formatDateForAPI(sessionData.date || sessionData.Date),
            startTime: sessionData.startTime || sessionData.StartTime,
            endTime: sessionData.endTime || sessionData.EndTime,
            location: sessionData.location || sessionData.Location || null,
          },
        ],
      };

      const result = await apiClient.put(
        `/admin/sessions/${sessionId}/with-timeslots`,
        backendData
      );
      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật session thành công",
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }
      throw error;
    }
  },

  // Xóa session
  deleteClassSession: async (sessionId) => {
    try {
      const result = await apiClient.delete(
        `/admin/sessions/${sessionId}/with-timeslots`
      );
      return {
        success: true,
        message: result.message || "Xóa session thành công",
      };
    } catch (error) {
      throw error;
    }
  },
};

export default classService;

import apiClient from "./apiClient";

const courseService = {
  // Instructor: Create course
  createCourse: async (courseData) => {
    try {
      const result = await apiClient.post("/instructor/courses", courseData);

      // Backend mới trả về format: { success, message, data }
      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo khóa học thành công",
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

  // Instructor: Get courses
  getCourses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/instructor/courses?${queryString}`);

      // Backend mới trả về format: { success, message, data, pagination }
      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      // Fallback to mock data if backend not ready
      return {
        success: true,
        data: [
          {
            CourseID: 1,
            Title: "Lập trình Web Frontend",
            Description: "Khóa học về HTML, CSS, JavaScript và React.js",
            Duration: 60,
            TuitionFee: "5000000.0",
            Status: "Published",
            InstructorID: 1,
            MaterialCount: 5,
            UnitCount: 8,
          },
          {
            CourseID: 2,
            Title: "Lập trình Java Backend",
            Description: "Khóa học về Spring Boot, REST API và Database",
            Duration: 80,
            TuitionFee: "6000000.0",
            Status: "Draft",
            InstructorID: 1,
            MaterialCount: 3,
            UnitCount: 10,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
    }
  },


  // Admin: Lấy tất cả khóa học
  getAllCourses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/admin/courses?${queryString}`);

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

  // Admin: Lấy danh sách khóa học có thể đăng ký
  getAvailableCourses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/admin/courses/available?${queryString}`
      );

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

  // Admin: Thêm học viên vào khóa học
  addStudentToCourse: async (courseId, studentData) => {
    try {
      const result = await apiClient.post(
        `/admin/courses/${courseId}/students`,
        studentData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Thêm học viên vào khóa học thành công",
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

  // Admin: Xóa học viên khỏi khóa học
  removeStudentFromCourse: async (courseId, studentId) => {
    try {
      const result = await apiClient.delete(
        `/admin/courses/${courseId}/students/${studentId}`
      );

      return {
        success: true,
        message: result.message || "Xóa học viên khỏi khóa học thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // Admin: Thêm timeslot cho khóa học
  addTimeslotToCourse: async (courseId, timeslotData) => {
    try {
      const result = await apiClient.post(
        `/admin/courses/${courseId}/timeslots`,
        timeslotData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Thêm timeslot cho khóa học thành công",
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

  // Admin: Xóa timeslot
  deleteTimeslot: async (courseId, timeslotId) => {
    try {
      const result = await apiClient.delete(
        `/admin/courses/${courseId}/timeslots/${timeslotId}`
      );

      return {
        success: true,
        message: result.message || "Xóa timeslot thành công",
      };
    } catch (error) {
      throw error;
    }
  },


  //   Tạo session cho lớp
  createSession: async (classId, sessionData) => {
    try {
      const result = await apiClient.post(
        `/instructor/classes/${classId}/sessions`,
        sessionData
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

  // Lấy sessions của lớp
  getClassSessions: async (classId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/instructor/classes/${classId}/sessions?${queryString}`
      );

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

  // Instructor: Cập nhật session
  updateSession: async (sessionId, sessionData) => {
    try {
      const result = await apiClient.put(
        `/instructor/sessions/${sessionId}`,
        sessionData
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

  // Instructor: Xóa session
  deleteSession: async (sessionId) => {
    try {
      const result = await apiClient.delete(
        `/instructor/sessions/${sessionId}`
      );

      return {
        success: true,
        message: result.message || "Xóa session thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // ========== MATERIAL MANAGEMENT APIs ==========

  // Instructor: Upload tài liệu cho khóa học
  uploadMaterial: async (courseId, formData) => {
    try {
      const result = await apiClient.post(
        `/instructor/courses/${courseId}/materials`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Upload tài liệu thành công",
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

  // Instructor: Lấy tài liệu của khóa học
  getCourseMaterials: async (courseId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/instructor/courses/${courseId}/materials?${queryString}`
      );

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

  // Instructor: Cập nhật tài liệu
  updateMaterial: async (materialId, materialData) => {
    try {
      const result = await apiClient.put(
        `/instructor/materials/${materialId}`,
        materialData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật tài liệu thành công",
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

  // Instructor: Xóa tài liệu
  deleteMaterial: async (materialId) => {
    try {
      const result = await apiClient.delete(
        `/instructor/materials/${materialId}`
      );

      return {
        success: true,
        message: result.message || "Xóa tài liệu thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // ========== LESSON MANAGEMENT APIs ==========

  // Instructor: Tạo lesson cho session
  createLesson: async (sessionId, lessonData) => {
    try {
      const result = await apiClient.post(
        `/instructor/sessions/${sessionId}/lessons`,
        lessonData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo lesson thành công",
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

  // Instructor: Lấy lessons của session
  getSessionLessons: async (sessionId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/instructor/sessions/${sessionId}/lessons?${queryString}`
      );

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

  // Instructor: Cập nhật lesson
  updateLesson: async (lessonId, lessonData) => {
    try {
      const result = await apiClient.put(
        `/instructor/lessons/${lessonId}`,
        lessonData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật lesson thành công",
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

  // Instructor: Xóa lesson
  deleteLesson: async (lessonId) => {
    try {
      const result = await apiClient.delete(`/instructor/lessons/${lessonId}`);

      return {
        success: true,
        message: result.message || "Xóa lesson thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // Instructor: Get course by ID
  getCourseById: async (courseId) => {
    try {
      const result = await apiClient.get(`/instructor/courses/${courseId}`);
      return result.data;
    } catch (error) {
      // Fallback to mock data
      return {
        success: true,
        data: {
          CourseID: courseId,
          Title: "Lập trình Web Frontend",
          Description: "Khóa học về HTML, CSS, JavaScript và React.js",
          Duration: 60,
          TuitionFee: "5000000.0",
          Status: "Published",
          InstructorID: 1,
          Units: [
            {
              UnitID: 1,
              Title: "HTML Cơ bản",
              Description: "Học các thẻ HTML cơ bản",
              Duration: "2 tuần",
            },
          ],
          Materials: [
            {
              MaterialID: 1,
              Title: "HTML Syllabus",
              FileURL: "/materials/html_syllabus.pdf",
              Status: "Published",
            },
          ],
        },
      };
    }
  },

  // Instructor: Update course
  updateCourse: async (courseId, courseData) => {
    try {
      const result = await apiClient.put(
        `/instructor/courses/${courseId}`,
        courseData
      );
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Instructor: Delete course
  deleteCourse: async (courseId) => {
    try {
      const result = await apiClient.delete(`/instructor/courses/${courseId}`);
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Instructor: Assign course to class
  assignCourseToClass: async (classId, courseId) => {
    try {
      const result = await apiClient.put(
        `/instructor/classes/${classId}/course`,
        {
          CourseID: courseId,
        }
      );
      return result.data;
    } catch (error) {
      throw error;
    }
  },

  // Instructor: Get assigned classes
  getAssignedClasses: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/instructor/classes?${queryString}`);
      return result.data;
    } catch (error) {
      // Fallback to mock data
      return {
        success: true,
        data: [
          {
            ClassID: 1,
            ClassName: "Lớp Java 2024",
            Status: "Sắp khai giảng",
            ZoomURL: "https://zoom.us/j/123456",
            CourseID: 1,
            CourseTitle: "Lập trình Web Frontend",
            EnrolledCount: 15,
            SessionCount: 5,
          },
          {
            ClassID: 2,
            ClassName: "Lớp React 2024",
            Status: "Đang hoạt động",
            ZoomURL: "https://zoom.us/j/789012",
            CourseID: 2,
            CourseTitle: "Lập trình Java Backend",
            EnrolledCount: 20,
            SessionCount: 8,
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };
    }
  },
};

export default courseService;

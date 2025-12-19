import apiClient from "./apiClient";

export const getCoursesApi = async () => {
  try {
    // Sử dụng endpoint /classes/courses (đã được sử dụng trong classService.getAllCourses)
    const response = await apiClient.get("/classes/courses");
    return response.data?.data || response.data || [];
  } catch (error) {
    // Nếu /classes/courses không có, thử /courses/admin
    if (error.response?.status === 404) {
      try {
        const response = await apiClient.get("/courses/admin");
        return response.data?.data || response.data || [];
      } catch (error2) {
        // Nếu /courses/admin không có, thử /courses/available
        if (error2.response?.status === 404) {
          try {
            const response = await apiClient.get("/courses/available");
            return response.data?.data || response.data || [];
          } catch (error3) {
            console.error("Get courses error (all endpoints failed):", error3);
            throw (
              error3.response?.data || { message: "Failed to fetch courses" }
            );
          }
        }
        console.error("Get courses error:", error2);
        throw error2.response?.data || { message: "Failed to fetch courses" };
      }
    }
    console.error("Get courses error:", error);
    throw error.response?.data || { message: "Failed to fetch courses" };
  }
};

export const searchCoursesApi = async ({
  search = "",
  category = "",
  sort = "newest",
  page = 1,
  pageSize = 10,
}) => {
  try {
    const params = new URLSearchParams({
      search,
      sort,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (category) params.append("category", category);

    const response = await apiClient.get(
      `/courses/search?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to search courses" };
  }
};

export const getCourseByIdApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Get course error:", error);
    throw error.response?.data || { message: "Failed to fetch course" };
  }
};

// Get course by ID for admin (có thể xem tất cả trạng thái)
// Lưu ý: Admin không có quyền truy cập endpoint instructor
// Nên sử dụng dữ liệu từ danh sách courses đã có thay vì gọi API mới
export const getCourseByIdForAdmin = async (courseId) => {
  try {
    // Thử endpoint thường (có thể chỉ trả về PUBLISHED)
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Get course for admin error:", error);
    throw error.response?.data || { message: "Failed to fetch course" };
  }
};

// Keep existing enrollCourseApi for backward compatibility
export const enrollCourseApi = async (courseId) => {
  try {
    const response = await apiClient.post("/courses/enroll", { courseId });
    return response.data;
  } catch (error) {
    console.error("Enrollment error:", error);
    throw error.response?.data || { message: "Enrollment failed" };
  }
};

export const getPopularCoursesApi = async () => {
  try {
    const response = await apiClient.get("/courses/popular");
    return response.data;
  } catch (error) {
    console.error("Get popular courses error:", error);
    throw (
      error.response?.data || { message: "Failed to fetch popular courses" }
    );
  }
};

export const getPopularClassesApi = async () => {
  try {
    const response = await apiClient.get("/courses/classes/popular");
    return response.data;
  } catch (error) {
    console.error("Get popular classes error:", error);
    throw (
      error.response?.data || { message: "Failed to fetch popular classes" }
    );
  }
};

export const getMyEnrolledCourses = async () => {
  try {
    const response = await apiClient.get("/courses/my-courses/enrolled");
    return response.data;
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    throw (
      error.response?.data || { message: "Failed to fetch enrolled courses" }
    );
  }
};

// Get courses for admin (only IN_REVIEW, APPROVED, PUBLISHED)
export const getCoursesForAdmin = async () => {
  try {
    const response = await apiClient.get("/courses/admin/all");
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Get courses for admin error:", error);
    throw error.response?.data || { message: "Failed to fetch courses" };
  }
};

// Update course status
export const updateCourseStatus = async (
  courseId,
  status,
  action = null,
  reason = null
) => {
  try {
    const payload = {
      Status: status,
      action: action,
    };

    // Thêm lý do từ chối nếu có
    if (reason) {
      payload.reason = reason;
    }

    const response = await apiClient.put(
      `/courses/${courseId}/status`,
      payload
    );
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Update course status error:", error);
    throw error.response?.data || { message: "Failed to update course status" };
  }
};

// Get course classes
export const getCourseClasses = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/classes`);
    // Backend trả về { classes: [...] }
    return response.data?.classes || response.data?.data || response.data || [];
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch course classes" };
  }
};

// Check course in use
export const checkCourseInUse = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/check-in-use`);
    return response.data?.data || response.data;
  } catch (error) {
    console.error("Check course in use error:", error);
    throw error.response?.data || { message: "Failed to check course in use" };
  }
};

export const getClassesByCourseApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/classes`);
    return response.data;
  } catch (error) {
    console.error("Get classes error:", error);
    throw error.response?.data || { message: "Failed to fetch classes" };
  }
};

export const transferClassApi = async (fromClassId, toClassId, courseId) => {
  try {
    const response = await apiClient.post(
      `/courses/${courseId}/transfer-class`,
      {
        fromClassId,
        toClassId,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Transfer class error:", error);
    throw error.response?.data || { message: "Failed to transfer class" };
  }
};

export const getScheduleClassesApi = async (filters = {}) => {
  try {
    const response = await apiClient.get("/courses/schedule/all-classes", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Get schedule classes error:", error);
    throw (
      error.response?.data || { message: "Failed to fetch schedule classes" }
    );
  }
};

export const enrollInClassApi = async (classId) => {
  try {
    const response = await apiClient.post("/courses/enroll", { classId });
    return response.data;
  } catch (error) {
    console.error("Enrollment error:", error);
    throw error.response?.data || { message: "Enrollment failed" };
  }
};

export const getCourseCurriculumApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/curriculum`);
    return response.data; // { curriculum: Unit[] }
  } catch (error) {
    console.error("Get curriculum error:", error);
    throw error.response?.data || { message: "Failed to fetch curriculum" };
  }
};

export const getMyClassesInCourseApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/my-classes`);
    return response.data;
  } catch (error) {
    console.error("Get my classes in course error:", error);
    throw error.response?.data || { message: "Failed to fetch your classes" };
  }
};

export const getCourseAssignmentsApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/assignments`);
    return response.data;
  } catch (error) {
    console.error("Get course assignments error:", error);
    throw error.response?.data || { message: "Failed to fetch assignments" };
  }
};

export const submitAssignmentApi = async (assignmentId, submissionData) => {
  try {
    const response = await apiClient.post(
      `/assignments/${assignmentId}/submit`,
      submissionData
    );
    return response.data;
  } catch (error) {
    console.error("Submit assignment error:", error);
    throw error.response?.data || { message: "Failed to submit assignment" };
  }
};

export const getSubmissionDetailApi = async (submissionId) => {
  try {
    const response = await apiClient.get(`/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error("Get submission detail error:", error);
    throw (
      error.response?.data || { message: "Failed to fetch submission detail" }
    );
  }
};

export const checkEnrollmentStatusApi = async (classId) => {
  try {
    const response = await apiClient.get(
      `/courses/classes/${classId}/enrollment-status`
    );
    return response.data;
  } catch (error) {
    console.error("Check enrollment error:", error);
    throw (
      error.response?.data || { message: "Failed to check enrollment status" }
    );
  }
};

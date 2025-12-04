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
            throw error3.response?.data || { message: "Failed to fetch courses" };
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

export const getCourseByIdApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Get course error:", error);
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
    throw error.response?.data || { message: "Failed to fetch popular courses" };
  }
};

export const getMyEnrolledCourses = async () => {
  try {
    const response = await apiClient.get("/courses/my-courses/enrolled");
    return response.data;
  } catch (error) {
    console.error("Get enrolled courses error:", error);
    throw error.response?.data || { message: "Failed to fetch enrolled courses" };
  }
};

// Get courses for admin (only IN_REVIEW, APPROVED, PUBLISHED)
export const getCoursesForAdmin = async () => {
  try {
    const response = await apiClient.get("/courses/admin", {
      params: { isAdmin: true },
    });
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Get courses for admin error:", error);
    throw error.response?.data || { message: "Failed to fetch courses" };
  }
};

// Update course status
export const updateCourseStatus = async (courseId, status, action = null) => {
  try {
    const response = await apiClient.put(`/courses/${courseId}/status`, {
      Status: status,
      action: action,
    });
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
    return response.data?.data || response.data || [];
  } catch (error) {
    console.error("Get course classes error:", error);
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
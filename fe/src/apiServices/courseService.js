import apiClient from "./apiClient";

export const getCoursesApi = async () => {
  try {
    const response = await apiClient.get("/courses");
    return response.data;
  } catch (error) {
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
    return response.data; // { items, total, page, pageSize }
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

export const getClassesByCourseApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/courses/${courseId}/classes`);
    return response.data;
  } catch (error) {
    console.error("Get classes error:", error);
    throw error.response?.data || { message: "Failed to fetch classes" };
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

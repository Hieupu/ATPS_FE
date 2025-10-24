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
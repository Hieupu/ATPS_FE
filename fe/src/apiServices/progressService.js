import apiClient from "./apiClient";

export const getLearnerProgressApi = async (learnerId, courseId = null) => {
  try {
    const url = courseId
      ? `/progress/learner/${learnerId}?courseId=${courseId}`
      : `/progress/learner/${learnerId}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Get learner progress error:", error);
    throw error.response?.data || { message: "Failed to fetch progress" };
  }
};

export const getUnitProgressApi = async (learnerId, courseId) => {
  try {
    const response = await apiClient.get(
      `/progress/learner/${learnerId}/course/${courseId}`
    );
    return response.data;
  } catch (error) {
    console.error("Get unit progress error:", error);
    throw error.response?.data || { message: "Failed to fetch unit progress" };
  }
};

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

export const getCourseDetailProgressApi = async (learnerId, courseId) => {
  try {
    const response = await apiClient.get(
      `/progress/learner/${learnerId}/course/${courseId}`
    );
    return response.data;
  } catch (error) {
    console.error("Get course detail progress error:", error);
    throw error.response?.data || { 
      message: "Failed to fetch course detail progress" 
    };
  }
};

export const getOverallStatisticsApi = async (learnerId) => {
  try {
    const response = await apiClient.get(
      `/progress/learner/${learnerId}/statistics`
    );
    return response.data;
  } catch (error) {
    console.error("Get overall statistics error:", error);
    throw error.response?.data || { 
      message: "Failed to fetch overall statistics" 
    };
  }
};
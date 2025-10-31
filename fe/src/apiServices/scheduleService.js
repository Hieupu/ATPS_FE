import apiClient from "./apiClient";

export const getLearnerScheduleApi = async (learnerId) => {
  try {
    const response = await apiClient.get(`/schedule/learner/${learnerId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch learner schedule" }
    );
  }
};

export const getInstructorScheduleApi = async (instructorId) => {
  try {
    const response = await apiClient.get(
      `/schedule/instructor/${instructorId}`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch instructor schedule" }
    );
  }
};

export const getSessionDetailsApi = async (sessionId) => {
  try {
    const response = await apiClient.get(`/schedule/session/${sessionId}`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch session details" }
    );
  }
};

export const createSessionApi = async (sessionData) => {
  try {
    const response = await apiClient.post("/schedule/", sessionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create session" };
  }
};

export const getAvailableInstructorSlotsApi = async (instructorId) => {
  try {
    const response = await apiClient.get(
      `/schedule/instructor/${instructorId}/available-slots`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch available slots" }
    );
  }
};

export const createOneOnOneBookingApi = async (bookingData) => {
  try {
    const response = await apiClient.post("/schedule/booking", bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create booking" };
  }
};

export const getInstructorClassesApi = async (instructorId) => {
  try {
    const response = await apiClient.get(
      `/schedule/instructor/${instructorId}/classes`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch instructor classes" }
    );
  }
};

export const getClassScheduleApi = async (classId) => {
  try {
    const response = await apiClient.get(`/schedule/class/${classId}/schedule`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch class schedule" };
  }
};

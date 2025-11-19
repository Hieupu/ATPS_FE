import apiClient from "./apiClient";

export const getLearnerAttendanceApi = async (learnerId) => {
  try {
    const response = await apiClient.get(`/attendance/learner/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error("Get learner attendance error:", error);
    throw error.response?.data || { message: "Failed to fetch attendance" };
  }
};

export const getAttendanceStatsApi = async (learnerId, sessionId = null) => {
  try {
    const url = sessionId
      ? `/attendance/learner/${learnerId}/stats?sessionId=${sessionId}`
      : `/attendance/learner/${learnerId}/stats`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Get attendance stats error:", error);
    throw error.response?.data || { message: "Failed to fetch attendance stats" };
  }
};

export const getAttendanceByClassApi = async (learnerId) => {
  try {
    const response = await apiClient.get(`/attendance/learner/${learnerId}/by-class`);
    return response.data;
  } catch (error) {
    console.error("Get attendance by class error:", error);
    throw error.response?.data || { message: "Failed to fetch attendance by class" };
  }
};

export const getAttendanceCalendarApi = async (learnerId, month, year) => {
  try {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    
    const url = `/attendance/learner/${learnerId}/calendar${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Get attendance calendar error:", error);
    throw error.response?.data || { message: "Failed to fetch attendance calendar" };
  }
};
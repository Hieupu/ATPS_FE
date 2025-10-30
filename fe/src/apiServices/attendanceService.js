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
    throw (
      error.response?.data || { message: "Failed to fetch attendance stats" }
    );
  }
};

export const updateAttendanceApi = async (attendanceId, status) => {
  try {
    const response = await apiClient.patch(`/attendance/${attendanceId}`, {
      Status: status,
    });
    return response.data;
  } catch (error) {
    console.error("Update attendance error:", error);
    throw error.response?.data || { message: "Failed to update attendance" };
  }
};

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

export const getInstructorWeeklyScheduleApi = async (
  instructorId,
  weekStartDate
) => {
  try {
    const response = await apiClient.get(
      `/schedule/instructor/${instructorId}/weekly-schedule`,
      { params: { weekStartDate } }
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to fetch weekly schedule" }
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

// Get booking requests for instructor (uses accountId from token)
// Removed instructor booking-requests APIs

// Get enrollment requests for learner (uses accountId from token)
export const getMyEnrollmentRequestsApi = async () => {
  try {
    const response = await apiClient.get(`/schedule/my-enrollment-requests`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch my enrollment requests",
      }
    );
  }
};

// Get sessions of an enrollment (for viewing details)
export const getEnrollmentSessionsApi = async (enrollmentId) => {
  try {
    const response = await apiClient.get(
      `/schedule/enrollment/${enrollmentId}/sessions`
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch enrollment sessions",
      }
    );
  }
};

// Handle session action (confirm, cancel, reschedule)
export const handleSessionActionApi = async (sessionId, actionData) => {
  try {
    const response = await apiClient.put(
      `/schedule/session/${sessionId}/action`,
      actionData
    );
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || { message: "Failed to handle session action" }
    );
  }
};

// Get pending reschedule requests for learner (uses accountId from token)
export const getPendingRescheduleRequestsApi = async () => {
  try {
    const response = await apiClient.get(`/schedule/pending-reschedule`);
    return response.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to fetch pending reschedule requests",
      }
    );
  }
};

// Handle reschedule response (accept/reject)
export const handleRescheduleResponseApi = async (sessionId, response) => {
  try {
    const response_data = await apiClient.put(
      `/schedule/session/${sessionId}/reschedule-response`,
      { response }
    );
    return response_data.data;
  } catch (error) {
    throw (
      error.response?.data || {
        message: "Failed to handle reschedule response",
      }
    );
  }
};

// Learner cancels pending enrollment
export const cancelMyEnrollmentApi = async (enrollmentId) => {
  try {
    const response = await apiClient.put(
      `/schedule/enrollment/${enrollmentId}/cancel`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to cancel enrollment" };
  }
};

export const checkScheduleConflictApi = async (classId) => {
  try {
    const response = await apiClient.get(`/schedule/check-conflict/${classId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to check schedule conflict" };
  }
};

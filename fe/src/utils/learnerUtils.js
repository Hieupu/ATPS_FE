import apiClient from "../apiServices/apiClient";

/**
 * Lấy LearnerID từ AccountID
 * @param {number} accountId - Account ID của user
 * @returns {Promise<number|null>} - LearnerID hoặc null
 */
export const getLearnerIdFromAccount = async (accountId) => {
  try {
    // Call backend API to get LearnerID
    const response = await apiClient.get(`/courses/learner-id/${accountId}`);
    return response.data.learnerId;
  } catch (error) {
    console.error("Error getting LearnerID:", error);
    return null;
  }
};

/**
 * Lấy InstructorID từ AccountID
 * @param {number} accountId - Account ID của user
 * @returns {Promise<number|null>} - InstructorID hoặc null
 */
export const getInstructorIdFromAccount = async (accountId) => {
  try {
    const response = await apiClient.get(`/instructors/account/${accountId}`);
    return response.data.instructorId;
  } catch (error) {
    console.error("Error getting InstructorID:", error);
    return null;
  }
};

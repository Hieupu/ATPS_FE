// services/learnerassignmentService.js
import apiClient from "./apiClient";

export const getAssignmentDetailsApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/learnerassignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Get assignment details error:", error);
    throw error.response?.data || { message: "Failed to fetch assignment details" };
  }
};

export const getAssignmentQuestionsApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/learnerassignments/${assignmentId}/questions`);
    
    // ✅ SỬA: Extract data từ trong `questions` object
    if (response.data.success && response.data.questions) {
      return response.data.questions; // Trả về {assignment, questions} trực tiếp
    }
    
    return response.data;
  } catch (error) {
    console.error("Get assignment questions error:", error);
    throw error.response?.data || { message: "Failed to fetch assignment questions" };
  }
};


// apiServices/learnerassignmentService.js
export const submitAssignmentApi = async (assignmentId, submissionData) => {
  try {
    const formData = new FormData();
    

    // Thêm answers (đảm bảo là object, không phải array)
    if (submissionData.answers && Object.keys(submissionData.answers).length > 0) {
      formData.append('answers', JSON.stringify(submissionData.answers));
    }

    // Thêm các trường khác
    if (submissionData.content) {
      formData.append('content', submissionData.content);
    }
    if (submissionData.durationSec) {
      formData.append('durationSec', submissionData.durationSec.toString());
    }

    // Thêm file audio nếu có
    if (submissionData.audioFile) {
      formData.append('audioFile', submissionData.audioFile);
    }

    const response = await apiClient.post(`/learnerassignments/${assignmentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    console.error("Submit assignment API error:", error);
    console.error("Error response:", error.response?.data);
    throw error.response?.data || { message: "Failed to submit assignment" };
  }
};

export const getSubmissionDetailsApi = async (submissionId) => {
  try {
    const response = await apiClient.get(`/learnerassignments/submissions/${submissionId}`);
    return response.data;
  } catch (error) {
    console.error("Get submission details error:", error);
    throw error.response?.data || { message: "Failed to fetch submission details" };
  }
};

export const getAssignmentResultsApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/learnerassignments/${assignmentId}/results`);
    return response.data;
  } catch (error) {
    console.error("Get assignment results error:", error);
    throw error.response?.data || { message: "Failed to fetch assignment results" };
  }
};
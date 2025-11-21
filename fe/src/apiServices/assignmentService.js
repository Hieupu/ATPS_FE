import apiClient from "./apiClient";

export const getAssignmentsApi = async (params = {}) => {
  try {
    const response = await apiClient.get("/assignments", { params });
    return response.data;
  } catch (error) {
    console.error("Get assignments error:", error);
    throw error.response?.data || { message: "Failed to fetch assignments" };
  }
};

export const getAssignmentByIdApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Get assignment error:", error);
    throw error.response?.data || { message: "Failed to fetch assignment" };
  }
};

export const createAssignmentApi = async (assignmentData) => {
  try {
    const response = await apiClient.post("/assignments", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Create assignment error:", error);
    throw error.response?.data || { message: "Failed to create assignment" };
  }
};

export const updateAssignmentApi = async (assignmentId, assignmentData) => {
  try {
    const response = await apiClient.put(`/assignments/${assignmentId}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error("Update assignment error:", error);
    throw error.response?.data || { message: "Failed to update assignment" };
  }
};

export const patchAssignmentStatusApi = async (assignmentId, status) => {
  try {
    const response = await apiClient.patch(`/assignments/${assignmentId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error("Patch assignment status error:", error);
    throw error.response?.data || { message: "Failed to update assignment status" };
  }
};

export const deleteAssignmentApi = async (assignmentId) => {
  try {
    const response = await apiClient.delete(`/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Delete assignment error:", error);
    throw error.response?.data || { message: "Failed to delete assignment" };
  }
};

const assignmentService = {
  getAssignmentsApi,
  getAssignmentByIdApi,
  createAssignmentApi,
  updateAssignmentApi,
  patchAssignmentStatusApi,
  deleteAssignmentApi,
};

export default assignmentService;


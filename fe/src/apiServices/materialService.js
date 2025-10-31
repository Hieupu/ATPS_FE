import apiClient from "./apiClient";

export const getCourseMaterialsApi = async (courseId) => {
  try {
    const response = await apiClient.get(`/materials/course/${courseId}`);
    return response.data;
  } catch (error) {
    console.error("Get course materials error:", error);
    throw error.response?.data || { message: "Failed to fetch materials" };
  }
};

export const getLearnerMaterialsApi = async (learnerId) => {
  try {
    const response = await apiClient.get(`/materials/learner/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error("Get learner materials error:", error);
    throw error.response?.data || { message: "Failed to fetch materials" };
  }
};

export const getMaterialByIdApi = async (materialId) => {
  try {
    const response = await apiClient.get(`/materials/${materialId}`);
    return response.data;
  } catch (error) {
    console.error("Get material error:", error);
    throw error.response?.data || { message: "Failed to fetch material" };
  }
};

export const createMaterialApi = async (materialData) => {
  try {
    const response = await apiClient.post("/materials", materialData);
    return response.data;
  } catch (error) {
    console.error("Create material error:", error);
    throw error.response?.data || { message: "Failed to create material" };
  }
};

export const updateMaterialApi = async (materialId, materialData) => {
  try {
    const response = await apiClient.put(
      `/materials/${materialId}`,
      materialData
    );
    return response.data;
  } catch (error) {
    console.error("Update material error:", error);
    throw error.response?.data || { message: "Failed to update material" };
  }
};

export const deleteMaterialApi = async (materialId) => {
  try {
    const response = await apiClient.delete(`/materials/${materialId}`);
    return response.data;
  } catch (error) {
    console.error("Delete material error:", error);
    throw error.response?.data || { message: "Failed to delete material" };
  }
};

import apiClient from "./apiClient";

const materialService = {

  // Tạo tài liệu cho khóa học
  createMaterial: async (materialData) => {
    try {
      const result = await apiClient.post("/materials", materialData);

      return {
        success: true,
        data: result.data,
        message: result.message || "Tạo tài liệu thành công",
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }

      throw error;
    }
  },

  // Lấy tài liệu của khóa học
  getCourseMaterials: async (courseId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/materials/course/${courseId}?${queryString}`
      );

      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },

  // Lấy tài liệu theo ID
  getMaterialById: async (materialId) => {
    try {
      const result = await apiClient.get(`/materials/${materialId}`);

      return {
        data: result.data,
      };
    } catch (error) {
      return { data: null };
    }
  },

  // Cập nhật tài liệu
  updateMaterial: async (materialId, materialData) => {
    try {
      const result = await apiClient.put(
        `/materials/${materialId}`,
        materialData
      );

      return {
        success: true,
        data: result.data,
        message: result.message || "Cập nhật tài liệu thành công",
      };
    } catch (error) {
      if (error.response?.data?.errors) {
        const validationError = new Error(
          error.response.data.message || "Validation failed"
        );
        validationError.success = false;
        validationError.errors = error.response.data.errors;
        throw validationError;
      }

      throw error;
    }
  },

  // Xóa tài liệu
  deleteMaterial: async (materialId) => {
    try {
      const result = await apiClient.delete(`/materials/${materialId}`);

      return {
        success: true,
        message: result.message || "Xóa tài liệu thành công",
      };
    } catch (error) {
      throw error;
    }
  },

  // Lấy tài liệu của học viên (đã enroll)
  getLearnerMaterials: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/materials/learner?${queryString}`);

      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },

  // Lấy tài liệu theo SessionID
  getSessionMaterials: async (sessionId, params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(
        `/materials/session/${sessionId}?${queryString}`
      );

      return {
        data: result.data || [],
        pagination: result.pagination,
      };
    } catch (error) {
      return {
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 },
      };
    }
  },
};

export default materialService;

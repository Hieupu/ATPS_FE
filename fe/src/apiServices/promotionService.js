import apiClient from "./apiClient";

const promotionService = {
  // Lấy danh sách promotion với phân trang + filter
  getPromotions: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append("status", status);
      if (search) queryParams.append("search", search);

      const response = await apiClient.get(
        `/promotions?${queryParams.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Get promotions error:", error);
      throw error.response?.data || {
        message: "Không thể tải danh sách promotion",
      };
    }
  },

  // Lấy chi tiết promotion
  getPromotionById: async (promotionId) => {
    try {
      const response = await apiClient.get(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error("Get promotion by id error:", error);
      throw error.response?.data || {
        message: "Không thể lấy thông tin promotion",
      };
    }
  },

  // Tạo promotion
  createPromotion: async (promotionData) => {
    try {
      const response = await apiClient.post("/promotions", promotionData);
      return response.data;
    } catch (error) {
      console.error("Create promotion error:", error);
      throw error.response?.data || {
        message: "Không thể tạo promotion",
      };
    }
  },

  // Cập nhật promotion
  updatePromotion: async (promotionId, updateData) => {
    try {
      const response = await apiClient.put(
        `/promotions/${promotionId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error("Update promotion error:", error);
      throw error.response?.data || {
        message: "Không thể cập nhật promotion",
      };
    }
  },

  // Xóa promotion
  deletePromotion: async (promotionId) => {
    try {
      const response = await apiClient.delete(`/promotions/${promotionId}`);
      return response.data;
    } catch (error) {
      console.error("Delete promotion error:", error);
      throw error.response?.data || {
        message: "Không thể xóa promotion",
      };
    }
  },

  // Kích hoạt promotion
  activatePromotion: async (promotionId) => {
    try {
      const response = await apiClient.post(
        `/promotions/${promotionId}/activate`
      );
      return response.data;
    } catch (error) {
      console.error("Activate promotion error:", error);
      throw error.response?.data || {
        message: "Không thể kích hoạt promotion",
      };
    }
  },

  // Vô hiệu hóa promotion
  deactivatePromotion: async (promotionId) => {
    try {
      const response = await apiClient.post(
        `/promotions/${promotionId}/deactivate`
      );
      return response.data;
    } catch (error) {
      console.error("Deactivate promotion error:", error);
      throw error.response?.data || {
        message: "Không thể vô hiệu hóa promotion",
      };
    }
  },

  // Kiểm tra mã promotion hợp lệ (dành cho FE khác dùng chung)
  validatePromotion: async (code) => {
    try {
      const response = await apiClient.get(`/promotions/validate/${code}`);
      return response.data;
    } catch (error) {
      console.error("Validate promotion error:", error);
      throw error.response?.data || {
        message: "Không thể kiểm tra promotion",
      };
    }
  },
};

export default promotionService;



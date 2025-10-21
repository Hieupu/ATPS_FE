// Auth Service - Authentication APIs
import apiClient from "./apiClient";

const authService = {
  // ========== AUTHENTICATION APIs ==========

  // Đăng ký tài khoản mới
  register: async (accountData) => {
    try {
      const result = await apiClient.post("/auth/register", accountData);

      return {
        success: true,
        data: result.data,
        message: result.message || "Đăng ký tài khoản thành công",
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

  // Lấy danh sách tài khoản
  getAccounts: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const result = await apiClient.get(`/auth/accounts?${queryString}`);

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

export default authService;

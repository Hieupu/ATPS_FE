// Khởi tạo axios instance (baseURL, interceptors)
import axios from "axios";

// Cấu hình baseURL - có thể lấy từ biến môi trường
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999/api";

// Tạo axios instance
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Thêm token vào header nếu có
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Xử lý lỗi chung và response format mới
apiClient.interceptors.response.use(
  (response) => {
    // Backend mới trả về format: { success, message, data, pagination }
    const backendResponse = response.data;

    if (backendResponse && typeof backendResponse === "object") {
      if (backendResponse.success === false) {
        // Backend trả về lỗi validation hoặc business logic
        const error = new Error(backendResponse.message || "API Error");
        error.response = {
          data: backendResponse,
          status: 400,
        };
        return Promise.reject(error);
      }

      // Trả về data trực tiếp từ backend response
      return {
        ...response,
        data: backendResponse.data || backendResponse,
        pagination: backendResponse.pagination,
        message: backendResponse.message,
      };
    }

    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      const backendError = error.response.data;

      // Xử lý lỗi từ backend mới
      if (backendError && backendError.success === false) {
        if (backendError.errors && backendError.errors.length > 0) {
        }
      }

      switch (error.response.status) {
        case 401:
          // Unauthorized - xóa token và redirect về login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          break;
        case 403:
          break;
        case 404:
          break;
        case 500:
          break;
        default:
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
    } else {
      // Lỗi khác
    }
    return Promise.reject(error);
  }
);

export default apiClient;

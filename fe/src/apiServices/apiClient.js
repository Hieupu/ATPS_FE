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

// Response interceptor - Xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      switch (error.response.status) {
        case 401:
          // Unauthorized - xóa token và redirect về login
          localStorage.removeItem("authToken");
          window.location.href = "/login";
          break;
        case 403:
          console.error("Forbidden - Bạn không có quyền truy cập");
          break;
        case 404:
          console.error("Not Found - Không tìm thấy tài nguyên");
          break;
        case 500:
          console.error("Server Error - Lỗi máy chủ");
          break;
        default:
          console.error("API Error:", error.response.data);
      }
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error("Network Error - Không thể kết nối đến server");
    } else {
      // Lỗi khác
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

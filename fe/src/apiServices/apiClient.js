import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:9999/api";

// const BASE_URL = process.env.REACT_APP_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.request.use(
  (config) => {
    // COMMENTED FOR TESTING - Token authentication
    // Thêm token test để bypass backend check
    const token = localStorage.getItem("token") || "test-token-for-development";
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response, config } = error;

    if (response) {
      const url = config?.url || "";
      const isAuthPath =
        url.includes("/login") ||
        url.includes("/register") ||
        url.includes("/auth/login") ||
        url.includes("/auth/register");

      switch (response.status) {
        case 401:
          localStorage.removeItem("token");
          if (!isAuthPath) {
            window.location.href = "/auth/login";
          }
          break;
        case 403:
          // COMMENTED FOR TESTING - Permission check
          // console.error("Forbidden - Bạn không có quyền truy cập");
          console.warn("403 Forbidden - Không có quyền truy cập (đã comment để test)");
          break;
        case 404:
          console.error("Not Found - Không tìm thấy tài nguyên");
          break;
        case 500:
          console.error("Server Error - Lỗi máy chủ");
          break;
        default:
          console.error("API Error:", response.data);
      }
    } else if (error.request) {
      console.error("Network Error - Không thể kết nối đến server");
    } else {
      console.error("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

import apiClient from "./apiClient";

const newsService = {
  // Lấy tất cả tin tức
  getAllNews: async (params = {}) => {
    try {
      const { page = 1, limit = 10, status, search } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) queryParams.append("status", status);
      if (search) queryParams.append("search", search);

      const response = await apiClient.get(`/news?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Get all news error:", error);
      throw error.response?.data || { message: "Failed to get news" };
    }
  },

  // Lấy tin tức theo ID
  getNewsById: async (newsId) => {
    try {
      const response = await apiClient.get(`/news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error("Get news by id error:", error);
      throw error.response?.data || { message: "Failed to get news" };
    }
  },

  // Tạo tin tức mới
  createNews: async (newsData) => {
    try {
      const response = await apiClient.post("/news", newsData);
      return response.data;
    } catch (error) {
      console.error("Create news error:", error);
      throw error.response?.data || { message: "Failed to create news" };
    }
  },

  // Cập nhật tin tức
  updateNews: async (newsId, updateData) => {
    try {
      const response = await apiClient.put(`/news/${newsId}`, updateData);
      return response.data;
    } catch (error) {
      console.error("Update news error:", error);
      throw error.response?.data || { message: "Failed to update news" };
    }
  },

  // Xóa tin tức
  deleteNews: async (newsId) => {
    try {
      const response = await apiClient.delete(`/news/${newsId}`);
      return response.data;
    } catch (error) {
      console.error("Delete news error:", error);
      throw error.response?.data || { message: "Failed to delete news" };
    }
  },

  // Lấy tin tức theo trạng thái
  getNewsByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/news/status?status=${status}`);
      return response.data;
    } catch (error) {
      console.error("Get news by status error:", error);
      throw error.response?.data || { message: "Failed to get news by status" };
    }
  },

  // Duyệt tin tức
  approveNews: async (newsId) => {
    try {
      const response = await apiClient.post(`/news/${newsId}/approve`);
      return response.data;
    } catch (error) {
      console.error("Approve news error:", error);
      throw error.response?.data || { message: "Failed to approve news" };
    }
  },

  // Từ chối tin tức
  rejectNews: async (newsId) => {
    try {
      const response = await apiClient.post(`/news/${newsId}/reject`);
      return response.data;
    } catch (error) {
      console.error("Reject news error:", error);
      throw error.response?.data || { message: "Failed to reject news" };
    }
  },

  // Deprecated: Sử dụng cloudinaryUpload từ utils/cloudinaryUpload.js thay vì method này
  // Giữ lại để backward compatibility nếu có code cũ đang dùng
  uploadImage: async (formData) => {
    console.warn(
      "uploadImage is deprecated. Use cloudinaryUpload from utils/cloudinaryUpload.js instead."
    );
    try {
      const response = await apiClient.post("/news/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error) {
      console.error("Upload news image error:", error);
      throw error.response?.data || { message: "Failed to upload image" };
    }
  },
};

export default newsService;

import apiClient from "./apiClient";

const emailLogService = {
  // Lấy danh sách email logs
  getAllEmailLogs: async (params = {}) => {
    try {
      const response = await apiClient.get("/email-logs", { params });
      // Backend trả về: { success: true, data: logs[], pagination: {...} }
      return response.data || { data: [], pagination: {} };
    } catch (error) {
      console.error("Get email logs error:", error);
      throw error.response?.data || { message: "Failed to fetch email logs" };
    }
  },

  // Lấy email log theo ID
  getEmailLogById: async (emailLogId) => {
    try {
      const response = await apiClient.get(`/email-logs/${emailLogId}`);
      // Backend trả về: { success: true, data: log }
      return response.data || {};
    } catch (error) {
      console.error("Get email log error:", error);
      throw error.response?.data || { message: "Failed to fetch email log" };
    }
  },
};

export default emailLogService;

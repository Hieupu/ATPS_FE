import apiClient from "./apiClient";

const dashboardService = {
  // Lấy thống kê tổng quan
  getDashboardStats: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const url = query ? `/dashboard/stats?${query}` : "/dashboard/stats";
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      throw error.response?.data || { message: "Failed to get dashboard stats" };
    }
  },

  // Lấy hoạt động gần đây
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await apiClient.get(`/dashboard/activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Get recent activities error:", error);
      throw error.response?.data || { message: "Failed to get recent activities" };
    }
  },

  // Lấy thống kê theo khoảng thời gian
  getStatsByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(
        `/dashboard/stats/range?startDate=${startDate}&endDate=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error("Get stats by date range error:", error);
      throw error.response?.data || { message: "Failed to get stats by date range" };
    }
  },
};

export default dashboardService;


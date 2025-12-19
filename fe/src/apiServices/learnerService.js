import apiClient from "./apiClient";

const learnerService = {
  // Lấy danh sách tất cả học viên
  getAllLearners: async () => {
    try {
      const response = await apiClient.get("/learners");
      const learnersList = response.data?.data || response.data || [];
      return learnersList;
    } catch (error) {
      console.error("Get learners error:", error);
      console.error("Error details:", error.response?.data);
      throw error.response?.data || { message: "Failed to fetch learners" };
    }
  },

  // Lấy thông tin chi tiết học viên
  getLearnerById: async (learnerId) => {
    try {
      const response = await apiClient.get(`/learners/${learnerId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get learner error:", error);
      throw error.response?.data || { message: "Failed to fetch learner" };
    }
  },

  // Tạo học viên mới
  createLearner: async (learnerData) => {
    try {
      const response = await apiClient.post("/learners", learnerData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create learner error:", error);
      throw error.response?.data || { message: "Failed to create learner" };
    }
  },

  // Cập nhật thông tin học viên
  updateLearner: async (learnerId, learnerData) => {
    try {
      const response = await apiClient.put(`/learners/${learnerId}`, learnerData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update learner error:", error);
      throw error.response?.data || { message: "Failed to update learner" };
    }
  },

  // Xóa học viên
  deleteLearner: async (learnerId) => {
    try {
      const response = await apiClient.delete(`/learners/${learnerId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete learner error:", error);
      throw error.response?.data || { message: "Failed to delete learner" };
    }
  },

  // Lấy học viên kèm danh sách lớp học
  getLearnerWithClasses: async (learnerId) => {
    try {
      const response = await apiClient.get(`/learners/${learnerId}/classes`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get learner with classes error:", error);
      throw error.response?.data || { message: "Failed to fetch learner classes" };
    }
  },

  // Lấy lịch học của học viên
  getLearnerSchedule: async (learnerId, startDate = null, endDate = null) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      const queryString = params.toString();
      const url = `/learners/${learnerId}/schedule${queryString ? `?${queryString}` : ""}`;
      const response = await apiClient.get(url);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get learner schedule error:", error);
      throw error.response?.data || { message: "Failed to fetch learner schedule" };
    }
  },

  // Lấy thống kê học viên
  getLearnerStatistics: async (learnerId) => {
    try {
      const response = await apiClient.get(`/learners/${learnerId}/statistics`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get learner statistics error:", error);
      throw error.response?.data || { message: "Failed to fetch learner statistics" };
    }
  },

  // Lấy điểm danh của học viên
  getLearnerAttendance: async (learnerId, classId = null) => {
    try {
      const params = classId ? `?classId=${classId}` : "";
      const response = await apiClient.get(`/learners/${learnerId}/attendance${params}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get learner attendance error:", error);
      throw error.response?.data || { message: "Failed to fetch learner attendance" };
    }
  },
};

export default learnerService;


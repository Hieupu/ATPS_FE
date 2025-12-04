import apiClient from "./apiClient";

const staffService = {
  getAllStaff: async () => {
    try {
      const response = await apiClient.get("/staff");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get staff error:", error);
      throw error.response?.data || { message: "Failed to fetch staff" };
    }
  },

  createStaff: async (staffData) => {
    try {
      const response = await apiClient.post("/staff", staffData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create staff error:", error);
      throw error.response?.data || { message: "Failed to create staff" };
    }
  },

  updateStaff: async (staffId, staffData) => {
    try {
      const response = await apiClient.put(`/staff/${staffId}`, staffData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update staff error:", error);
      throw error.response?.data || { message: "Failed to update staff" };
    }
  },

  deleteStaff: async (staffId) => {
    try {
      const response = await apiClient.delete(`/staff/${staffId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete staff error:", error);
      throw error.response?.data || { message: "Failed to delete staff" };
    }
  },
};

export default staffService;


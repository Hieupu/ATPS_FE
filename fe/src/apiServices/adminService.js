import apiClient from "./apiClient";

const adminService = {
  getAllAdmins: async () => {
    try {
      const response = await apiClient.get("/admins");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get admins error:", error);
      throw error.response?.data || { message: "Failed to fetch admins" };
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await apiClient.post("/admins", adminData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create admin error:", error);
      throw error.response?.data || { message: "Failed to create admin" };
    }
  },

  updateAdmin: async (adminId, adminData) => {
    try {
      const response = await apiClient.put(`/admins/${adminId}`, adminData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update admin error:", error);
      throw error.response?.data || { message: "Failed to update admin" };
    }
  },

  deleteAdmin: async (adminId) => {
    try {
      const response = await apiClient.delete(`/admins/${adminId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete admin error:", error);
      throw error.response?.data || { message: "Failed to delete admin" };
    }
  },
};

export default adminService;


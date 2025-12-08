import apiClient from "./apiClient";

const accountService = {
  // Cập nhật thông tin account
  // Fallback: nếu endpoint /accounts/:accId không tồn tại, sẽ throw error để frontend xử lý
  updateAccount: async (accId, accountData) => {
    try {
      const response = await apiClient.put(`/accounts/${accId}`, accountData);
      return response.data?.data || response.data;
    } catch (error) {
      // Nếu endpoint không tồn tại (404), throw error để frontend có thể fallback
      if (error.response?.status === 404) {
        console.warn(`Endpoint /accounts/${accId} không tồn tại, sẽ fallback sang update instructor/learner`);
        throw { ...error, isEndpointNotFound: true };
      }
      console.error("Update account error:", error);
      throw error.response?.data || { message: "Failed to update account" };
    }
  },

  // Lấy thông tin account theo ID
  getAccountById: async (accId) => {
    try {
      const response = await apiClient.get(`/accounts/${accId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get account error:", error);
      throw error.response?.data || { message: "Failed to fetch account" };
    }
  },
};

export default accountService;


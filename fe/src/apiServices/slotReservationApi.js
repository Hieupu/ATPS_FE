// apiServices/slotReservationApi.js
import apiClient from "./apiClient";

export const slotReservationApi = {
  // Giữ chỗ slot
  reserveSlot: async (timeslotId, date) => {
    try {
      const response = await apiClient.post('/slot-reservation/reserve', {
        timeslotId,
        date
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reserve slot" };
    }
  },

  // Hủy giữ chỗ slot
  releaseSlot: async (timeslotId, date) => {
    try {
      const response = await apiClient.post('/slot-reservation/release', {
        timeslotId,
        date
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to release slot" };
    }
  },

  // Kiểm tra trạng thái slot
  checkSlotStatus: async (timeslotId, date) => {
    try {
      const response = await apiClient.get('/slot-reservation/check', {
        params: { timeslotId, date }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to check slot status" };
    }
  },

  // Lấy danh sách slot đang giữ
  getMyReservedSlots: async () => {
    try {
      const response = await apiClient.get('/slot-reservation/my-slots');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to get reserved slots" };
    }
  },

  // Hủy tất cả slot
  releaseAllSlots: async () => {
    try {
      const response = await apiClient.post('/slot-reservation/release-all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to release all slots" };
    }
  }
};
import apiClient from "./apiClient";

export const createPaymentLinkApi = async (classID, promoCode) => {
  const response = await apiClient.post("/payment/create", {
    classID,
    promoCode,
  });
  return response.data;
};

export const updatePaymentStatusApi = async (orderCode, status, amount) => {
  const response = await apiClient.post("/payment/update-status", {
    orderCode,
    status,
    amount,
  });
  return response.data;
};

export const checkPromotionCodeApi = async (code) => {
  const response = await apiClient.post("/payment/check-promo", { code });
  return response.data;
};

export const getPaymentHistoryApi = async (learnerId) => {
  try {
    const response = await apiClient.get(`/payment/learner/${learnerId}`);
    return response.data;
  } catch (error) {
    console.error("Get payment history error:", error);
    throw error.response?.data || { message: "Failed to fetch payment history" };
  }
};

export const requestRefundApi = async (enrollmentId, reason) => {
  try {
    const response = await apiClient.post("/payment/refunds/request", {
      enrollmentId,
      reason
    });
    return response.data;
  } catch (error) {
    console.error("Request refund error:", error);
    throw error.response?.data || { message: "Failed to request refund" };
  }
};

export const cancelRefundRequestApi = async (refundId) => {
  const response = await apiClient.put(`/payment/refund/${refundId}/cancel`);
  return response.data;
};

export const getAdminPaymentHistoryApi = async (params = {}) => {
  const response = await apiClient.get("/payment/admin/history", { params });
  return response.data;
};
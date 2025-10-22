import apiClient from "./apiClient";

export const createPaymentLinkApi = async (courseId) => {
  const response = await apiClient.post("/payment/create", { courseId });
  return response.data;
};

export const updatePaymentStatusApi = async (orderCode, status) => {
  const response = await apiClient.post("/payment/update-status", { 
    orderCode, 
    status 
  });
  return response.data;
};
import apiClient from "./apiClient";

export const createPaymentLinkApi = async (classID) => {
  const response = await apiClient.post("/payment/create", { classID });
  return response.data;
};

export const updatePaymentStatusApi = async (orderCode, status) => {
  const response = await apiClient.post("/payment/update-status", {
    orderCode,
    status,
  });
  return response.data;
};

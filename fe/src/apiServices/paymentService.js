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

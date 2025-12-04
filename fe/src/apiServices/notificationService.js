import apiClient from "./apiClient";

export const listNotificationsApi = async (limit = 20) => {
  const res = await apiClient.get(`/notifications?limit=${limit}`);
  return res.data;
};

export const markNotificationReadApi = async (id) => {
  const res = await apiClient.post(`/notifications/${id}/mark`);
  return res.data;
};

export const markAllNotificationsReadApi = async () => {
  const res = await apiClient.post(`/notifications/mark-all`);
  return res.data;
};
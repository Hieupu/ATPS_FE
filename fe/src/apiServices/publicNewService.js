import apiClient from "./apiClient";

export const getPublicNewsApi = async () => {
  try {
    const response = await apiClient.get('/new');
    return response.data;
  } catch (error) {
    console.error("Get active news error:", error);
    throw error.response?.data || { message: "Failed to fetch news" };
  }
};

export const getNewsDetailApi = async (newsId) => {
  try {
    const response = await apiClient.get(`/new/${newsId}`);
    return response.data;
  } catch (error) {
    console.error("Get news detail error:", error);
    throw error.response?.data || { message: "Failed to fetch news detail" };
  }
};
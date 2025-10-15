import apiClient from "./apiClient";

export const loginApi = async (email, password) => {
  try {
    const response = await apiClient.post("/login", { email, password });
    return response.data;
  } catch (error) {
    console.log("❌ API error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Login failed" };
  }
};

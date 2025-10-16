import apiClient from "./apiClient";

export const loginApi = async (email, password) => {
  try {
    const response = await apiClient.post("/login", { email, password });
    const data = response.data;
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    console.error(" Login API error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Đăng nhập thất bại" };
  }
};

export const registerApi = async (payload) => {
  try {
    const response = await apiClient.post("/register", payload);
    const data = response.data;

    return data;
  } catch (error) {
    console.error("Register API error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Đăng ký thất bại" };
  }
};

export const startGoogleAuth = () => {
  const base = apiClient.defaults.baseURL.replace(/\/$/, "");
  window.location.href = `${base}/google`;
};

export const startFacebookAuth = () => {
  const base = apiClient.defaults.baseURL.replace(/\/$/, "");
  window.location.href = `${base}/facebook`;
};

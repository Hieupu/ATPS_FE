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

// Gửi email đặt lại mật khẩu
export const sendResetEmail = async (email) => {
  try {
    const response = await apiClient.post("/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gửi email thất bại" };
  }
};

// Xác thực mã đặt lại mật khẩu
export const verifyResetCode = async (email, code) => {
  try {
    const response = await apiClient.post("/verify-reset-code", { email, code });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Xác thực thất bại" };
  }
};

// Đổi mật khẩu mới
export const resetPassword = async (resetToken, newPassword) => {
  try {
    const response = await apiClient.post("/reset-password", {
      resetToken,
      newPassword,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Đặt lại mật khẩu thất bại" };
  }
};

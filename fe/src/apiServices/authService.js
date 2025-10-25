import apiClient from "./apiClient";

export const loginApi = async (email, password) => {
  try {
    const response = await apiClient.post("/login", { email, password });
    const data = response.data;
    
    if (data?.token) {
      // Lưu cả token và thông tin user (bao gồm role)
      const userData = {
        ...data.user,
        token: data.token
      };
      
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
    }

    return data;
  } catch (error) {
    console.error("Login API error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Đăng nhập thất bại" };
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
    const response = await apiClient.post("/verify-reset-code", {
      email,
      code,
    });
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

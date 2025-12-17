import apiClient from "./apiClient";

export const loginApi = async (email, password, rememberMe = false) => {
  try {
    const response = await apiClient.post("/login", {
      email,
      password,
      rememberMe,
    });

    const data = response.data;

    if (data?.token) {
      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      const expiryTime = Date.now() + data.expiresIn * 1000;
      localStorage.setItem("tokenExpiry", expiryTime.toString());
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
  console.log(base);
};

export const startFacebookAuth = () => {
  const base = apiClient.defaults.baseURL.replace(/\/$/, "");
  window.location.href = `${base}/facebook`;
};

// Gửi mã xác thực khi đăng ký
export const sendRegisterVerification = async (email) => {
  try {
    const response = await apiClient.post("/send-register-verification", { email });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Gửi mã xác thực thất bại" };
  }
};

// Xác thực mã đăng ký
export const verifyRegisterCodeApi = async (email, code) => {
  try {
    const response = await apiClient.post("/verify-register-code", {
      email,
      code,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Xác thực thất bại" };
  }
};
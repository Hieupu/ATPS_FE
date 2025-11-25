/**
 * Kiểm tra token còn hạn không
 */
export const isTokenValid = () => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("tokenExpiry");

  if (!token || !expiry) return false;

  return Date.now() < parseInt(expiry);
};

/**
 * Lấy token
 */
export const getToken = () => {
  return localStorage.getItem("token");
};

/**
 * Lấy thông tin user
 */
export const getUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

/**
 * Tính thời gian token còn lại (milliseconds)
 */
export const getTokenTimeLeft = () => {
  const expiry = localStorage.getItem("tokenExpiry");
  if (!expiry) return 0;

  const timeLeft = parseInt(expiry) - Date.now();
  return Math.max(0, timeLeft);
};

/**
 * Format thời gian còn lại thành text dễ đọc
 */
export const formatTimeLeft = (milliseconds) => {
  if (milliseconds === 0) return "Đã hết hạn";

  const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `Còn ${days} ngày`;
  if (hours > 0) return `Còn ${hours} giờ`;
  return `Còn ${minutes} phút`;
};

/**
 * Logout và redirect về trang login
 */
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiry");
  window.location.href = "/auth/login";
};

/**
 * Lưu thông tin auth sau khi login
 */
export const setAuth = (token, expiresIn, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem("tokenExpiry", expiryTime.toString());
};

/**
 * Xóa thông tin auth
 */
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("tokenExpiry");
};


import apiClient from './apiClient';

export const getUsers = async () => {
  const response = await apiClient.get('/users');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await apiClient.put(`/users/${id}`, userData);
  return response.data;
};

export const getUserProfile = async (id, role) => {
  // Trong thực tế, endpoint này sẽ lấy thông tin chi tiết từ bảng tương ứng
  const response = await apiClient.get(`/user-profile/${id}?role=${role}`);
  return response.data;
};

export const updateUserProfile = async (id, role, profileData) => {
  const response = await apiClient.put(`/user-profile/${id}`, {
    role,
    ...profileData
  });
  return response.data;
};

// apiServices/userService.js - THÊM HÀM NÀY
export const getUserRole = async (id) => {
  try {
    const response = await apiClient.get(`/users/${id}/role`);
    return response.data.role;
  } catch (error) {
    console.error('Error getting user role:', error);
    throw error;
  }
};
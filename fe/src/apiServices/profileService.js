import apiClient from "./apiClient";

export const getProfileApi = async () => {
  const response = await apiClient.get("/profile");
  return response.data;
};

export const updateProfileApi = async (profileData) => {
  const response = await apiClient.put("/profile", profileData);
  return response.data;
};

export const changePasswordApi = async (passwordData) => {
  const response = await apiClient.put("/profile/password", passwordData);
  return response.data;
};

export const updateAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  
  const response = await apiClient.put("/profile/avatar", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
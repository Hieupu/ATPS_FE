import apiClient from "./apiClient";
import { cloudinaryUpload } from "../utils/cloudinaryUpload";

const uploadService = {
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post(
        "/instructors/upload-avatar",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data?.data || response.data;
    } catch (error) {
      console.error("[uploadService] uploadAvatar error:", error);
      throw (
        error.response?.data || {
          message: "Failed to upload avatar",
        }
      );
    }
  },

  uploadCV: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post(
        "/instructors/upload-cv",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return response.data?.data || response.data;
    } catch (error) {
      console.error("[uploadService] uploadCV error:", error);
      throw (
        error.response?.data || {
          message: "Failed to upload CV",
        }
      );
    }
  },

  // Upload ảnh tin tức lên Cloudinary
  uploadNewsImage: async (file, setUploading) => {
    try {
      const imageUrl = await cloudinaryUpload(file, setUploading);
      if (!imageUrl) {
        throw new Error("Không thể tải ảnh lên Cloudinary");
      }
      return { path: imageUrl, url: imageUrl };
    } catch (error) {
      console.error("[uploadService] uploadNewsImage error:", error);
      throw (
        error.response?.data || {
          message: "Failed to upload news image",
        }
      );
    }
  },
};

export default uploadService;

import apiClient from "./apiClient";

const emailTemplateService = {
  // Lấy danh sách templates
  getAllTemplates: async (params = {}) => {
    try {
      const response = await apiClient.get("/email-templates", { params });
      // Backend trả về: { success: true, data: templates[], pagination: {...} }
      return response.data || { data: [], pagination: {} };
    } catch (error) {
      console.error("Get email templates error:", error);
      throw (
        error.response?.data || { message: "Failed to fetch email templates" }
      );
    }
  },

  // Lấy template theo ID
  getTemplateById: async (templateId) => {
    try {
      const response = await apiClient.get(`/email-templates/${templateId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get email template error:", error);
      throw (
        error.response?.data || { message: "Failed to fetch email template" }
      );
    }
  },

  // Tạo template mới
  createTemplate: async (templateData) => {
    try {
      const response = await apiClient.post("/email-templates", templateData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create email template error:", error);
      throw (
        error.response?.data || { message: "Failed to create email template" }
      );
    }
  },

  // Cập nhật template
  updateTemplate: async (templateId, templateData) => {
    try {
      const response = await apiClient.put(
        `/email-templates/${templateId}`,
        templateData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update email template error:", error);
      throw (
        error.response?.data || { message: "Failed to update email template" }
      );
    }
  },

  // Xóa template
  deleteTemplate: async (templateId) => {
    try {
      const response = await apiClient.delete(`/email-templates/${templateId}`);
      return response.data;
    } catch (error) {
      console.error("Delete email template error:", error);
      throw (
        error.response?.data || { message: "Failed to delete email template" }
      );
    }
  },

  // Preview template
  previewTemplate: async (templateId, variables = {}) => {
    try {
      const response = await apiClient.post(
        `/email-templates/${templateId}/preview`,
        {
          variables,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Preview email template error:", error);
      throw (
        error.response?.data || { message: "Failed to preview email template" }
      );
    }
  },

  // Test gửi email
  testSendEmail: async (templateId, testEmail, variables = {}) => {
    try {
      const response = await apiClient.post(
        `/email-templates/${templateId}/test`,
        {
          testEmail,
          variables,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Test send email error:", error);
      throw error.response?.data || { message: "Failed to test send email" };
    }
  },

  // Gửi email sử dụng template code
  sendEmailWithTemplate: async (
    templateCode,
    recipientEmail,
    variables = {}
  ) => {
    try {
      const response = await apiClient.post("/email-templates/send", {
        templateCode,
        recipientEmail,
        variables,
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Send email with template error:", error);
      throw error.response?.data || { message: "Failed to send email" };
    }
  },

  // Lấy danh sách biến có thể sử dụng cho EventType
  getAvailableVariables: async (eventType) => {
    try {
      const response = await apiClient.get(
        `/email-templates/variables/${eventType}`
      );
      return response.data?.data || [];
    } catch (error) {
      console.error("Get available variables error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch available variables",
        }
      );
    }
  },
};

export default emailTemplateService;

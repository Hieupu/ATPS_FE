// Utility functions để toggle status giữa active/inactive/banned

/**
 * Toggle status: active -> inactive/banned, inactive/banned -> active
 * @param {string} currentStatus - Current status value
 * @param {string} entityType - Type of entity: 'admin'|'staff'|'instructor'|'learner'
 * @returns {string} New status value
 */
export const toggleStatus = (currentStatus, entityType = "admin") => {
  const normalized = (currentStatus || "active").toLowerCase();

  // For learners: active <-> banned (no inactive)
  if (entityType === "learner") {
    if (normalized === "active") {
      return "banned";
    }
    return "active";
  }

  // For admin/staff/instructor: active <-> inactive
  if (normalized === "active") {
    return "inactive";
  }
  return "active";
};

/**
 * Get status label in Vietnamese
 * @param {string} status - Status value
 * @returns {string} Status label
 */
export const getStatusLabel = (status) => {
  const normalized = (status || "active").toLowerCase();
  const labels = {
    active: "Hoạt động",
    inactive: "Không hoạt động",
    banned: "Bị khóa",
  };
  return labels[normalized] || "Không rõ";
};

/**
 * Get button label for toggle status
 * @param {string} status - Current status value
 * @returns {string} Button label
 */
export const getStatusButtonLabel = (status) => {
  const normalized = (status || "active").toLowerCase();
  if (normalized === "active") {
    return "Khóa";
  }
  return "Mở khóa";
};

/**
 * Handle status toggle with API call
 * @param {object} item - Item object (admin/staff/instructor/learner)
 * @param {object} accountService - Account service instance
 * @param {function} onSuccess - Callback after successful toggle
 * @param {string} entityType - Type of entity
 * @returns {Promise<void>}
 */
export const handleStatusToggle = async (
  item,
  accountService,
  onSuccess,
  entityType = "admin"
) => {
  if (!item || !item.AccID) {
    alert("Không tìm thấy thông tin tài khoản");
    return;
  }

  const currentStatus = item.Status || item.AccountStatus || "active";
  const newStatus = toggleStatus(currentStatus, entityType);

  try {
    await accountService.updateAccount(item.AccID, { Status: newStatus });
    alert(
      `${getStatusButtonLabel(currentStatus)} thành công! Trạng thái: ${getStatusLabel(newStatus)}`
    );
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error("Toggle status error:", error);
    alert(
      error?.response?.data?.message ||
        error?.message ||
        "Không thể đổi trạng thái"
    );
  }
};


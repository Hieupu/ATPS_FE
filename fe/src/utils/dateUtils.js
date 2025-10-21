// Utility functions for safe date handling
// Based on backend TIMEZONE_HANDLING_GUIDE.md

/**
 * Format date for API calls - safe timezone handling
 * @param {Date|string} date - Date object or date string
 * @returns {string} - YYYY-MM-DD format
 */
export const formatDateForAPI = (date) => {
  // Nếu là string và đã là YYYY-MM-DD format
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // Nếu là Date object, sử dụng local date components
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // Nếu là string khác, xử lý an toàn
  if (typeof date === "string") {
    // Nếu là ISO string, extract date part trước khi parse
    if (date.includes("T")) {
      const datePart = date.split("T")[0];
      if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
        return datePart; // Return date part directly
      }
    }

    // Parse string thành Date object
    const dateObj = new Date(date);
    if (!isNaN(dateObj.getTime())) {
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }

  return date;
};

/**
 * Parse date string safely
 * @param {string} dateString - Date string in various formats
 * @returns {Date} - Date object
 */
export const parseDateSafely = (dateString) => {
  if (!dateString) return null;

  // Nếu đã là YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    const [year, month, day] = dateString.split("-");
    return new Date(year, month - 1, day);
  }

  // Nếu là ISO string, extract date part
  if (dateString.includes("T")) {
    const datePart = dateString.split("T")[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      const [year, month, day] = datePart.split("-");
      return new Date(year, month - 1, day);
    }
  }

  // Fallback
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Validate date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} - True if valid YYYY-MM-DD format
 */
export const isValidDateFormat = (dateString) => {
  if (!dateString || typeof dateString !== "string") return false;

  // Check YYYY-MM-DD format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  // Check if it's a valid date
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Get current date in YYYY-MM-DD format
 * @returns {string} - Current date in YYYY-MM-DD format
 */
export const getCurrentDateString = () => {
  return new Date().toLocaleDateString("en-CA");
};

/**
 * Test timezone handling (for debugging)
 */
export const testTimezoneHandling = () => {
  const testDates = [
    "2025-01-25",
    "2025-01-25T00:00:00.000Z",
    "2025-01-25T07:00:00.000Z",
    "2025-01-25T17:00:00.000Z",
    "2025-01-25T23:59:59.000Z",
  ];

  testDates.forEach((dateStr) => {
    const date = new Date(dateStr);
    const localDate = date.toLocaleDateString("en-CA");
    const isoDate = date.toISOString().split("T")[0];
  });
};

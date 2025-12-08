import dayjs from "dayjs";
import { getDayFromDate } from "../../../../utils/validate";

/**
 * Utility functions và constants chung cho ClassWizard
 */

export const weekdayLabelMap = {
  CN: "Chủ Nhật",
  T2: "Thứ 2",
  T3: "Thứ 3",
  T4: "Thứ 4",
  T5: "Thứ 5",
  T6: "Thứ 6",
  T7: "Thứ 7",
};

export const formatDateForDisplay = (value) => {
  if (!value) return "";
  if (value.includes("/")) return value;
  const parts = value.split("-");
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  }
  return value;
};

export const getWeekdayLabel = (dateStr) => {
  if (!dateStr) return "";
  const code = getDayFromDate(dateStr);
  return weekdayLabelMap[code] || code || "";
};

export const parseDisplayDateToISO = (displayValue) => {
  if (!displayValue) return "";
  const normalized = displayValue.replace(/\s/g, "");
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(normalized)) {
    const [day, month, year] = normalized.split("/");
    return `${year}-${month}-${day}`;
  }
  return null;
};

export const toISODateString = (value) => {
  if (!value) return "";
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
      const [day, month, year] = trimmed.split("/");
      return `${year}-${month}-${day}`;
    }
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : "";
};

export const formatTimeRange = (start, end) => {
  if (!start || !end) return "";
  const format = (time) => {
    if (typeof time !== "string") return "";
    const parts = time.split(":");
    return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
  };
  return `${format(start)} - ${format(end)}`;
};

export const normalizeTimeString = (value) => {
  if (!value) return "";
  const str = String(value).trim();
  const [timePart] = str.split(/[.\s]/); // Cắt phần đuôi (.000000) hoặc timezone
  if (/^\d{2}:\d{2}:\d{2}$/.test(timePart)) return timePart;
  if (/^\d{2}:\d{2}$/.test(timePart)) return `${timePart}:00`;
  return timePart;
};

export const countSelectionSlots = (selection = {}) =>
  Object.values(selection || {}).reduce((total, slots) => {
    if (!Array.isArray(slots)) return total;
    return total + slots.length;
  }, 0);


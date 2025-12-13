import React, { useEffect, useMemo, useState } from "react";
import classService from "../../../apiServices/classService";
import "./style.css";

const DAY_OPTIONS = [
  { label: "Chủ nhật", value: "Sunday" },
  { label: "Thứ hai", value: "Monday" },
  { label: "Thứ ba", value: "Tuesday" },
  { label: "Thứ tư", value: "Wednesday" },
  { label: "Thứ năm", value: "Thursday" },
  { label: "Thứ sáu", value: "Friday" },
  { label: "Thứ bảy", value: "Saturday" },
];
const DAY_ORDER = DAY_OPTIONS.map((day) => day.value);
const DAY_LABEL_MAP = DAY_OPTIONS.reduce((acc, item) => {
  acc[item.value] = item.label;
  return acc;
}, {});

const normalizeTime = (value) => {
  if (!value) return "";
  const str = String(value).trim().split(/[.\s]/)[0];
  if (/^\d{2}:\d{2}:\d{2}$/.test(str)) return str;
  if (/^\d{2}:\d{2}$/.test(str)) return `${str}:00`;
  return str;
};

const formatTime = (value) => normalizeTime(value).slice(0, 5);
const getDayOrderIndex = (day) => {
  // Normalize day name: capitalize first letter, lowercase the rest
  const normalizedDay = day
    ? day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
    : "";
  const index = DAY_ORDER.indexOf(normalizedDay);
  return index === -1 ? DAY_ORDER.length + 1 : index;
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
const DEFAULT_PAGE_SIZE = 10;
const MAX_FETCH_LIMIT = 500;

const TimeslotManagerPage = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ keyword: "", day: "" });
  const [searchInput, setSearchInput] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageError, setPageError] = useState("");

  const fetchTimeslots = async ({ page = 1, limit = MAX_FETCH_LIMIT } = {}) => {
    setLoading(true);
    try {
      const result = await classService.getAllTimeslots({
        page,
        limit,
      });
      const list = Array.isArray(result?.data) ? result.data : [];

      setTimeslots(
        list.map((slot) => {
          // Normalize Day: capitalize first letter, lowercase the rest
          const dayValue = slot.Day || slot.day || "";
          const normalizedDay =
            dayValue && dayValue.length > 0
              ? dayValue.charAt(0).toUpperCase() +
                dayValue.slice(1).toLowerCase()
              : "";

          return {
            ...slot,
            Day: normalizedDay,
            StartTime: normalizeTime(slot.StartTime || slot.startTime || ""),
            EndTime: normalizeTime(slot.EndTime || slot.endTime || ""),
          };
        })
      );
      setTablePage(1);
      setPageError("");
    } catch (error) {
      console.error("Failed to load timeslots:", error);
      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể tải danh sách ca học."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeslots({ page: 1, limit: MAX_FETCH_LIMIT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTimeslots = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return timeslots
      .filter((slot) => {
        // Normalize filter day for comparison
        const filterDay = filters.day
          ? filters.day.charAt(0).toUpperCase() +
            filters.day.slice(1).toLowerCase()
          : "";
        const slotDay = slot.Day
          ? slot.Day.charAt(0).toUpperCase() + slot.Day.slice(1).toLowerCase()
          : "";

        if (filters.day && slotDay !== filterDay) return false;
        if (!keyword) return true;
        return (
          slot.Day.toLowerCase().includes(keyword) ||
          slot.StartTime.toLowerCase().includes(keyword) ||
          slot.EndTime.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const dayDiff = getDayOrderIndex(a.Day) - getDayOrderIndex(b.Day);
        if (dayDiff !== 0) return dayDiff;
        return a.StartTime.localeCompare(b.StartTime);
      });
  }, [timeslots, filters]);

  const totalFiltered = filteredTimeslots.length;
  const totalPages = Math.max(1, Math.ceil((totalFiltered || 1) / pageSize));

  const paginatedTimeslots = useMemo(() => {
    const startIndex = (tablePage - 1) * pageSize;
    return filteredTimeslots.slice(startIndex, startIndex + pageSize);
  }, [filteredTimeslots, tablePage, pageSize]);

  useEffect(() => {
    if (tablePage > totalPages) {
      setTablePage(totalPages);
    }
  }, [tablePage, totalPages]);

  useEffect(() => {
    setSearchInput(filters.keyword || "");
    setDayInput(filters.day || "");
  }, [filters.keyword, filters.day]);

  const handleApplyFilters = () => {
    setFilters({
      keyword: searchInput.trim(),
      day: dayInput,
    });
    setTablePage(1);
  };

  const handleKeywordKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleApplyFilters();
    }
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setDayInput("");
    setFilters({ keyword: "", day: "" });
    setTablePage(1);
  };


  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setTablePage(1);
  };

  const emptyStateMessage =
    filters.day || filters.keyword
      ? "Không tìm thấy ca học phù hợp bộ lọc hiện tại."
      : "Chưa có ca học nào.";

  return (
    <div className="admin-page-container">
      <div className="page-header timeslot-header">
        <div>
          <h2>Quản lý ca học</h2>
        </div>
      </div>

      <div className="card">
        <div className="card-header table-header">
          <div className="filter-actions">
            <div className="filter-row">
              <input
                type="text"
                placeholder="Tìm theo thứ hoặc giờ..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeywordKeyDown}
              />
              <select
                value={dayInput}
                onChange={(e) => setDayInput(e.target.value)}
              >
                <option value="">Tất cả các thứ</option>
                {DAY_OPTIONS.map((day) => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>
              <button type="button" onClick={handleApplyFilters}>
                Lọc
              </button>
              <button type="button" onClick={handleClearFilters}>
                Xóa lọc
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Đang tải ca học...</div>
        ) : totalFiltered === 0 ? (
          <div className="timeslot-empty">{emptyStateMessage}</div>
        ) : (
          <div className="table-wrapper">
            {pageError && <div className="form-error mb-3">{pageError}</div>}
            <div className="timeslot-table">
              <div className="timeslot-table-head">
                <span>Thứ</span>
                <span>Khung giờ</span>
              </div>
              {paginatedTimeslots.map((slot) => (
                <div className="timeslot-table-row" key={slot.TimeslotID}>
                  <div className="timeslot-thumb">
                    <span>{DAY_LABEL_MAP[slot.Day] || slot.Day || "—"}</span>
                  </div>
                  <div className="timeslot-time-col">
                    <div className="time-range">
                      {formatTime(slot.StartTime)} - {formatTime(slot.EndTime)}
                    </div>
                    <div className="time-id">ID: {slot.TimeslotID}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="pagination-controls">
              <div className="pagination-buttons">
                <button
                  type="button"
                  onClick={() => setTablePage(1)}
                  disabled={tablePage === 1 || loading}
                >
                  « Đầu
                </button>
                <button
                  type="button"
                  onClick={() => setTablePage((prev) => Math.max(1, prev - 1))}
                  disabled={tablePage === 1 || loading}
                >
                  ‹ Trước
                </button>
                <span>
                  Trang {tablePage}/{totalPages} · {totalFiltered} ca
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setTablePage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={tablePage === totalPages || loading}
                >
                  Sau ›
                </button>
                <button
                  type="button"
                  onClick={() => setTablePage(totalPages)}
                  disabled={tablePage === totalPages || loading}
                >
                  Cuối »
                </button>
              </div>
              <div className="pagination-page-size">
                <label>
                  Hiển thị
                  <select
                    value={pageSize}
                    onChange={(e) =>
                      handlePageSizeChange(Number(e.target.value))
                    }
                    disabled={loading}
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size}/trang
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeslotManagerPage;

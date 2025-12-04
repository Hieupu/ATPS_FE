import React, { useEffect, useMemo, useState } from "react";
import classService from "../../../apiServices/classService";
import TimeslotFormModal from "../components/timeslot-management/TimeslotFormModal";
import TimeslotDeleteModal from "../components/timeslot-management/TimeslotDeleteModal";
import "./style.css";

const DAY_OPTIONS = [
  { label: "Chủ nhật", value: "CN" },
  { label: "Thứ hai", value: "T2" },
  { label: "Thứ ba", value: "T3" },
  { label: "Thứ tư", value: "T4" },
  { label: "Thứ năm", value: "T5" },
  { label: "Thứ sáu", value: "T6" },
  { label: "Thứ bảy", value: "T7" },
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

const ensureSeconds = (value) => {
  const normalized = normalizeTime(value);
  return normalized.length === 5 ? `${normalized}:00` : normalized;
};

const formatTime = (value) => normalizeTime(value).slice(0, 5);
const formatTimeForInput = (value) => {
  if (!value) return "";
  const normalized = normalizeTime(value);
  return normalized ? normalized.slice(0, 5) : "";
};
const getDayOrderIndex = (day) => {
  const index = DAY_ORDER.indexOf(day?.toUpperCase());
  return index === -1 ? DAY_ORDER.length + 1 : index;
};

const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100];
const DEFAULT_PAGE_SIZE = 10;
const MAX_FETCH_LIMIT = 500;

const PencilIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5l4 4L7 21H3v-4L16.5 3.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

const TimeslotManagerPage = () => {
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [filters, setFilters] = useState({ keyword: "", day: "" });
  const [searchInput, setSearchInput] = useState("");
  const [dayInput, setDayInput] = useState("");
  const [tablePage, setTablePage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editingSlot, setEditingSlot] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [modalError, setModalError] = useState("");
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
        list.map((slot) => ({
          ...slot,
          Day: (slot.Day || slot.day || "").toUpperCase(),
          StartTime: normalizeTime(slot.StartTime || slot.startTime || ""),
          EndTime: normalizeTime(slot.EndTime || slot.endTime || ""),
        }))
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
        if (filters.day && slot.Day !== filters.day) return false;
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

  const isEditing = Boolean(editingSlot);

  const handleOpenCreateModal = () => {
    setEditingSlot(null);
    setModalError("");
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (slot) => {
    setEditingSlot(slot);
    setModalError("");
    setFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setFormModalOpen(false);
    setEditingSlot(null);
    setModalError("");
  };

  const handleSubmitTimeslot = async (data) => {
    if (!data?.Day || !data?.StartTime || !data?.EndTime) {
      setModalError("Vui lòng chọn đầy đủ Thứ, Giờ bắt đầu và Giờ kết thúc.");
      return false;
    }

    const start = ensureSeconds(data.StartTime);
    const end = ensureSeconds(data.EndTime);
    if (start >= end) {
      setModalError("Giờ kết thúc phải lớn hơn giờ bắt đầu.");
      return false;
    }

    try {
      setSubmitting(true);
      if (editingSlot) {
        await classService.updateTimeslot(editingSlot.TimeslotID, {
          Day: data.Day,
          StartTime: start,
          EndTime: end,
        });
      } else {
        await classService.createTimeslot({
          Day: data.Day,
          StartTime: start,
          EndTime: end,
        });
      }
      await fetchTimeslots({ page: 1, limit: MAX_FETCH_LIMIT });
      handleCloseFormModal();
      return true;
    } catch (error) {
      setModalError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể lưu ca học. Vui lòng thử lại."
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (slot) => {
    if (!slot) return;
    setDeleteTarget({
      TimeslotID: slot.TimeslotID || slot.id,
      Day: slot.Day || slot.day || "",
      StartTime: slot.StartTime || slot.startTime || "",
      EndTime: slot.EndTime || slot.endTime || "",
    });
  };

  const handleCloseDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.TimeslotID) return;
    try {
      setSubmitting(true);
      await classService.deleteTimeslot(deleteTarget.TimeslotID);
      setDeleteTarget(null);
      fetchTimeslots({ page: 1, limit: MAX_FETCH_LIMIT });
    } catch (error) {
      setPageError(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể xóa ca học. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePageSizeChange = (value) => {
    setPageSize(value);
    setTablePage(1);
  };

  const filterLabel = filters.day
    ? DAY_OPTIONS.find((d) => d.value === filters.day)?.label ||
      "Bộ lọc theo thứ"
    : "Tất cả các thứ";
  const emptyStateMessage =
    filters.day || filters.keyword
      ? "Không tìm thấy ca học phù hợp bộ lọc hiện tại."
      : "Chưa có ca học nào.";
  const deleteLabel = deleteTarget
    ? `${deleteTarget.Day || "—"} · ${formatTime(
        deleteTarget.StartTime
      )} - ${formatTime(deleteTarget.EndTime)}`
    : "";
  const modalInitialData = editingSlot
    ? {
        Day: editingSlot.Day || "",
        StartTime: formatTimeForInput(editingSlot.StartTime),
        EndTime: formatTimeForInput(editingSlot.EndTime),
      }
    : { Day: "", StartTime: "", EndTime: "" };

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

      <TimeslotFormModal
        open={formModalOpen}
        mode={isEditing ? "edit" : "create"}
        dayOptions={DAY_OPTIONS}
        initialData={modalInitialData}
        submitting={submitting}
        error={modalError}
        onClose={handleCloseFormModal}
        onSubmit={handleSubmitTimeslot}
      />

      <TimeslotDeleteModal
        open={Boolean(deleteTarget)}
        label={deleteLabel}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        submitting={submitting}
      />
    </div>
  );
};

export default TimeslotManagerPage;

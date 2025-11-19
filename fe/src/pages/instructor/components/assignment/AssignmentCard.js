import React, { useState } from 'react';
import { Calendar, Eye, MoreVertical, Edit2, Trash2 ,ToggleLeft } from 'lucide-react';
import "./style/AssignmentCard.css";
import ConfirmDialog from "./ConfirmDialog";

export default function AssignmentCard({
  assignment,
  onEdit,
  onViewSubmissions,
  onDelete,
  onViewDetail,
  onChangeStatus
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const deadlineValue = assignment.Deadline || assignment.deadline;

  const prettyDate = (d) => {
    if (!d) return null;
    try {
      const dt = new Date(d);
      if (isNaN(dt.getTime())) return d;
      const pad = (n) => (n < 10 ? "0" + n : n);
      const day = pad(dt.getDate());
      const month = pad(dt.getMonth() + 1);
      const year = dt.getFullYear();
      const hour = pad(dt.getHours());
      const minute = pad(dt.getMinutes());
      return `${hour}:${minute} ${day}/${month}/${year}`;
    } catch {
      return d;
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      quiz: { label: 'Trắc nghiệm', className: 'assignment-badge-blue' },
      audio: { label: 'Nói', className: 'assignment-badge-green' },
      video: { label: 'Nghe', className: 'assignment-badge-purple' },
      document: { label: 'Tài liệu', className: 'assignment-badge-yellow' }
    };
    return badges[type?.toLowerCase()] || badges.document;
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { label: 'Hoạt động', className: 'assignment-badge-green' },
      draft: { label: 'Bản nháp', className: 'assignment-badge-gray' },
      archived: { label: 'Đã đóng', className: 'assignment-badge-red' }
    };
    return badges[status?.toLowerCase()] || badges.draft;
  };

  const handleDelete = () => {
    setOpenConfirm(true);
    setShowMenu(false);
  };

  const typeBadge = getTypeBadge(assignment.Type);
  const statusBadge = getStatusBadge(assignment.Status);

  return (

    <div className="assignment-card">
      <div className="assignment-card-header">
        <div className="assignment-card-info">
          <div className="assignment-card-title-row">
            <h3 className="assignment-card-title">{assignment.Title}</h3>
            <span className={typeBadge.className}>{typeBadge.label}</span>
            <span className={statusBadge.className}>{statusBadge.label}</span>
          </div>
          <p className="assignment-card-meta">
            {assignment.CourseTitle || 'Chưa gán khóa học'}
            {assignment.UnitTitle && ` • ${assignment.UnitTitle}`}
          </p>
        </div>

        <div className="assignment-card-actions">
          <div className="assignment-menu-wrapper">
            <button
              className="assignment-menu-button"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                <div
                  className="assignment-menu-backdrop"
                  onClick={() => setShowMenu(false)}
                />
                <div className="assignment-dropdown-menu">
                  {/* Chỉnh sửa */}
                  <button
                    className="assignment-menu-item"
                    onClick={() => {
                      onEdit?.(assignment.AssignmentID);
                      setShowMenu(false);
                    }}
                  >
                    <Edit2 size={16} />
                    <span>Chỉnh sửa</span>
                  </button>

                  {/* 🆕 Nút xem chi tiết */}
                  <button
                    className="assignment-menu-item"
                    onClick={() => {
                      onViewDetail?.(assignment.AssignmentID);
                      setShowMenu(false);
                    }}
                  >
                    <Eye size={16} />
                    <span>Xem chi tiết</span>
                  </button>

                  {/* 🆕 Nút trạng thái */}
                  <button
                    className="assignment-menu-item"
                    onClick={() => {
                      onChangeStatus?.(assignment.AssignmentID);
                      setShowMenu(false);
                    }}
                  >
                    <ToggleLeft  size={16} /> {/* dùng icon toggle */}
                    <span>Trạng thái</span>
                  </button>

                  {/* Xóa */}
                  <button
                    className="assignment-menu-item assignment-menu-item-danger"
                    onClick={handleDelete}
                  >
                    <Trash2 size={16} />
                    <span>Xóa</span>
                  </button>
                </div>

              </>
            )}
            <ConfirmDialog
              open={openConfirm}
              title="Xác nhận xóa"
              message={`Bạn có chắc muốn xóa bài tập "${assignment.Title}"?`}
              confirmText="Xóa"
              cancelText="Hủy"
              onCancel={() => setOpenConfirm(false)}
              onConfirm={() => {
                onDelete?.(assignment.AssignmentID);
                setOpenConfirm(false);
              }}
            />
          </div>
        </div>
      </div>

      <p className="assignment-card-description">{assignment.Description}</p>

      <div className="assignment-card-footer">
        <div className="assignment-deadline-info">
          <Calendar size={16} color="#9CA3AF" />
          <span className="assignment-deadline-text">
            Hạn:{" "}
            {deadlineValue
              ? prettyDate(deadlineValue)
              : "Không giới hạn"}
          </span>
        </div>

        <div className="assignment-button-group">
          <button
            className="assignment-view-button"
            onClick={() => onViewSubmissions?.(assignment.AssignmentID)}
          >
            <Eye size={16} />
            <span>Bài nộp</span>
          </button>
        </div>
      </div>
    </div>

  );
}

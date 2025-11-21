import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  People,
  CalendarToday,
  Person,
  AccessTime,
  AttachMoney,
  Group,
  Event,
  Lightbulb,
  Description,
  HourglassEmpty,
  CheckCircle,
  Send,
  Publish,
} from "@mui/icons-material";
import {
  CLASS_STATUS,
  getStatusInfo,
  normalizeStatus,
} from "../../../../constants/classStatus";
import "./ClassList.css";

const ClassList = ({
  classes,
  courses = [], // Thêm courses để lấy Fee từ course
  instructors = [], // Thêm instructors để lấy thông tin giảng viên
  onEdit,
  onManageStudents,
  onSubmitForApproval,
  onReview,
  onPublish,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);

  const handleMenuOpen = (event, classItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(classItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };

  const handleEdit = () => {
    if (selectedClass) {
      onEdit(selectedClass);
    }
    handleMenuClose();
  };

  const handleManageStudents = () => {
    if (selectedClass) {
      onManageStudents(selectedClass);
    }
    handleMenuClose();
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case CLASS_STATUS.DRAFT:
        return "status-draft";
      case CLASS_STATUS.PENDING_APPROVAL:
        return "status-pending";
      case CLASS_STATUS.APPROVED:
        return "status-approved";
      case CLASS_STATUS.OPEN:
        return "status-open";
      case CLASS_STATUS.ON_GOING:
        return "status-ongoing";
      case CLASS_STATUS.CLOSED:
        return "status-closed";
      case CLASS_STATUS.CANCELLED:
        return "status-cancelled";
      default:
        return "status-inactive";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";
    
    const normalized = normalizeStatus(status);
    const statusInfo = getStatusInfo(normalized);
    
    // Nếu có label từ constants, dùng nó
    if (statusInfo && statusInfo.label) {
      return statusInfo.label;
    }
    
    // Fallback cho các status cũ (backward compatibility)
    const statusMap = {
      DRAFT: "Nháp",
      PENDING_APPROVAL: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      PUBLISHED: "Đã xuất bản",
      OPEN: "Đang tuyển sinh",
      ON_GOING: "Đang diễn ra",
      CLOSED: "Đã kết thúc",
      CANCELLED: "Đã hủy",
      "Đang hoạt động": "Đang hoạt động",
      "Sắp khai giảng": "Sắp khai giảng",
      "Đã kết thúc": "Đã kết thúc",
      "Chưa phân giảng viên": "Chưa phân giảng viên",
    };
    return statusMap[status] || statusMap[normalized] || status;
  };

  return (
    <div className="class-list-container">
      {classes.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có lớp học nào. Hãy thêm lớp học mới!</p>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((classItem) => {
            const classId = classItem.ClassID || classItem.id;
            const className = classItem.Name || classItem.title;
            const classStatus = classItem.Status || classItem.status;

            // Lấy Fee: từ class trước, nếu không có thì lấy từ course
            const classFee = classItem.Fee || classItem.tuitionFee;
            const courseId = classItem.CourseID || classItem.courseId;
            const course = courses.find(
              (c) => (c.CourseID || c.id) === courseId
            );
            const displayFee = classFee || course?.Fee || course?.fee || null;

            // Lấy thông tin giảng viên
            const instructorId = classItem.InstructorID || classItem.instructorId;
            let instructor = classItem.Instructor;
            
            // Nếu không có Instructor object, tìm từ instructors list
            if (!instructor && instructorId && instructors && instructors.length > 0) {
              // Thử tìm với cả string và number (tránh type mismatch)
              instructor = instructors.find(
                (inst) => {
                  const instId = inst.InstructorID || inst.id;
                  // So sánh với nhiều cách để tránh type mismatch
                  return (
                    instId === instructorId ||
                    instId === parseInt(instructorId) ||
                    parseInt(instId) === instructorId ||
                    String(instId) === String(instructorId) ||
                    Number(instId) === Number(instructorId)
                  );
                }
              );
            }
            
            // Fallback nếu vẫn không tìm thấy
            if (!instructor) {
              // Thử lấy từ các trường khác có thể có
              if (classItem.instructorName) {
                instructor = {
                  FullName: classItem.instructorName,
                };
              } else if (instructorId) {
                // Có InstructorID nhưng không tìm thấy instructor
                console.warn(
                  `Class ${classId} (${className}) has InstructorID ${instructorId} but instructor not found.`,
                  `Available instructors: ${instructors?.length || 0}`,
                  `Instructor IDs in list: ${instructors?.map(i => i.InstructorID || i.id).join(', ') || 'none'}`
                );
                instructor = {
                  FullName: "Chưa phân công",
                };
              } else {
                instructor = {
                  FullName: "Chưa phân công",
                };
              }
            }

            return (
              <div key={classId} className="class-card">
                <div className="class-header" style={{ position: "relative" }}>
                  <h3 className="class-title">{className}</h3>
                  <span
                    className={`status-badge ${getStatusClass(classStatus)}`}
                  >
                    {getStatusLabel(classStatus)}
                  </span>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, classItem)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      padding: "4px",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                  >
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>
                </div>

                <div className="class-body">
                  <p className="class-description">
                    {classItem.description || ""}
                  </p>

                  <div className="class-info">
                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Person sx={{ fontSize: 16 }} /> Giảng viên:
                      </span>
                      <span className="info-value">
                        {instructor.FullName || instructor.fullName || ""}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AccessTime sx={{ fontSize: 16 }} /> Số buổi học:
                      </span>
                      <span className="info-value">
                        {classItem.Numofsession ||
                        classItem.ExpectedSessions ||
                        classItem.expectedSessions ||
                        classItem.numofsession
                          ? `${
                              classItem.Numofsession ||
                              classItem.numofsession ||
                              classItem.ExpectedSessions ||
                              classItem.expectedSessions
                            } buổi`
                          : ""}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 16 }} /> Học phí:
                      </span>
                      <span className="info-value">
                        {displayFee ? formatCurrency(displayFee) : ""}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Group sx={{ fontSize: 16 }} /> Học viên:
                      </span>
                      <span className="info-value">
                        {(() => {
                          // Lấy số học viên đã enroll
                          const enrolledCount = Array.isArray(
                            classItem.enrolledStudents
                          )
                            ? classItem.enrolledStudents.length
                            : classItem.enrolledCount || 0;

                          // Lấy sĩ số tối đa (hỗ trợ cả Maxstudent và MaxLearners)
                          const maxLearners =
                            classItem.Maxstudent ||
                            classItem.maxstudent ||
                            classItem.MaxLearners ||
                            classItem.maxLearners ||
                            classItem.maxStudents;

                          // Hiển thị
                          if (
                            maxLearners !== undefined &&
                            maxLearners !== null
                          ) {
                            return `${enrolledCount}/${maxLearners}`;
                          } else if (enrolledCount > 0) {
                            return `${enrolledCount}`;
                          }
                          return "";
                        })()}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Event sx={{ fontSize: 16 }} /> Ngày dự kiến bắt đầu:
                      </span>
                      <span className="info-value">
                        {classItem.OpendatePlan ||
                        classItem.StartDate ||
                        classItem.startDate ||
                        classItem.opendatePlan || ""}
                      </span>
                    </div>

                    {(classItem.Opendate || classItem.opendate) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Event sx={{ fontSize: 16 }} /> Ngày bắt đầu thực tế:
                        </span>
                        <span className="info-value">
                          {classItem.Opendate || classItem.opendate}
                        </span>
                      </div>
                    )}

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Event sx={{ fontSize: 16 }} /> Ngày dự kiến kết thúc:
                      </span>
                      <span className="info-value">
                        {classItem.EnddatePlan ||
                        classItem.EndDate ||
                        classItem.endDate ||
                        classItem.enddatePlan || ""}
                      </span>
                    </div>

                    {(classItem.Enddate || classItem.enddate) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Event sx={{ fontSize: 16 }} /> Ngày kết thúc thực tế:
                        </span>
                        <span className="info-value">
                          {classItem.Enddate || classItem.enddate}
                        </span>
                      </div>
                    )}

                    {(classItem.ZoomID || classItem.zoomID) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Description sx={{ fontSize: 16 }} /> Zoom ID:
                        </span>
                        <span className="info-value">
                          {classItem.ZoomID || classItem.zoomID}
                        </span>
                      </div>
                    )}

                    {(classItem.Zoompass || classItem.zoompass) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Description sx={{ fontSize: 16 }} /> Mật khẩu Zoom:
                        </span>
                        <span className="info-value">
                          {classItem.Zoompass || classItem.zoompass}
                        </span>
                      </div>
                    )}

                    {classItem.ZoomURL && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Description sx={{ fontSize: 16 }} /> Zoom URL:
                        </span>
                        <span className="info-value">
                          <a
                            href={classItem.ZoomURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#667eea",
                              textDecoration: "underline",
                            }}
                          >
                            {classItem.ZoomURL}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="class-actions">
                  {/* Workflow Actions based on status */}
                  {normalizeStatus(classStatus) === CLASS_STATUS.DRAFT && onSubmitForApproval && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onSubmitForApproval(classId)}
                      title="Gửi cho giảng viên chuẩn bị"
                    >
                      <Send sx={{ fontSize: 14, mr: 0.5 }} />
                      Gửi giảng viên
                    </button>
                  )}

                  {normalizeStatus(classStatus) === CLASS_STATUS.PENDING_APPROVAL && onReview && (
                    <>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onReview(classId, "APPROVE")}
                        title="Chấp thuận"
                      >
                        <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                        Duyệt
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onReview(classId, "REJECT")}
                        title="Từ chối"
                      >
                        <Delete sx={{ fontSize: 14, mr: 0.5 }} />
                        Từ chối
                      </button>
                    </>
                  )}

                  {normalizeStatus(classStatus) === CLASS_STATUS.APPROVED && onPublish && (
                    <button
                      className="btn btn-purple btn-sm"
                      onClick={() => onPublish(classId)}
                      title="Xuất bản"
                    >
                      <Publish sx={{ fontSize: 14, mr: 0.5 }} />
                      Xuất bản
                    </button>
                  )}

                  {/* Lịch button - always visible */}
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() =>
                      navigate(`/admin/classes/${classId}/schedule`)
                    }
                    title="Quản lý lịch học"
                  >
                    <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                    Lịch
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 200,
          },
        }}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ fontSize: 18, mr: 1.5 }} /> Chỉnh sửa
        </MenuItem>
        <MenuItem onClick={handleManageStudents}>
          <People sx={{ fontSize: 18, mr: 1.5 }} /> Quản lý học viên
        </MenuItem>
      </Menu>
    </div>
  );
};

export default ClassList;
